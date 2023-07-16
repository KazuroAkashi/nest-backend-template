import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountType, Permission, User } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { Error, JwtPayload } from "../types";
import { flow } from "fp-ts/lib/function";
import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { RegisterDto as RegisterLocalDto } from "../dto/RegisterLocalDto";
import { JWT_SECRET_OBJ, ERRORS } from "../globals";
import { CacheService } from "../util/cache.service";
import * as argon2 from "argon2";
import { LoginDto as LoginLocalDto } from "../dto/LoginLocalDto";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
    ) {}

    async findUserByTagOrThrow(tag: string): Promise<User> {
        return this.prisma.user.findUniqueOrThrow({ where: { tag } });
    }

    async findUserByTag(tag: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { tag } });
    }

    findUserByToken: (token: string) => TE.TaskEither<Error, User> =
        this.cache.cached(
            (token: string) => "tokens." + token,
            flow(
                TE.fromNullable({
                    title: "MalformedError",
                    details: "Token cannot be null",
                }),
                TE.chainEitherK((token) => this.jwtVerify(token)),
                TE.map((token) => this.jwtService.decode(token) as JwtPayload),
                TE.map((payload) => payload.tag),
                TE.filterOrElse(
                    (id) => id !== undefined,
                    () => ({
                        title: "MalformedError",
                        details: "Id cannot be null (How did this happen?)",
                    }),
                ),
                TE.chain((tag) =>
                    TE.tryCatch(
                        () => this.findUserByTagOrThrow(tag),
                        (reason) => ({
                            title: "DatabaseError",
                            details: "User not found",
                        }),
                    ),
                ),
            ),
        );

    async hasPermissions({
        tag,
        perms,
    }: {
        tag: string;
        perms: Permission[];
    }): Promise<boolean> {
        if (!perms || perms.length === 0) return true;
        else
            return (
                this.prisma.user.findFirst({
                    where: {
                        tag,
                        role: {
                            perms: {
                                hasEvery: perms,
                            },
                        },
                    },
                }) !== null
            );
    }

    async fetchPermissions(tag: string) {
        return this.prisma.user
            .findUnique({
                where: {
                    tag,
                },
                select: {
                    role: {
                        select: {
                            perms: true,
                        },
                    },
                },
            })
            .then((res) => res?.role?.perms);
    }

    generateJwtToken(tag: string): { jwt_token: string } | null {
        return {
            jwt_token: this.jwtService.sign(
                {
                    tag,
                } satisfies JwtPayload,
                JWT_SECRET_OBJ,
            ),
        };
    }

    private jwtVerify(token: string): E.Either<Error, string> {
        try {
            this.jwtService.verify(token, JWT_SECRET_OBJ);
            return E.right(token);
        } catch (err) {
            return E.left({
                title: "JwtError",
                details: err,
            });
        }
    }

    async registerLocal(registerDto: RegisterLocalDto) {
        const user = await this.prisma.user.findUnique({
            where: { tag: registerDto.tag },
        });

        if (user != null)
            throw new BadRequestException({ code: ERRORS.TAG_MUST_BE_UNIQUE });

        const account = await this.prisma.account.findFirst({
            where: {
                email: registerDto.email,
            },
        });

        if (account != null)
            throw new BadRequestException({
                code: ERRORS.EMAIL_MUST_BE_UNIQUE,
            });

        const passHash = await argon2.hash(registerDto.password);

        const acc = await this.prisma.account.create({
            data: {
                email: registerDto.email,
                passHash,
                name: registerDto.tag,
                type: AccountType.LOCAL,
                user: {
                    create: {
                        tag: registerDto.tag,
                        roleName: "Default",
                    },
                },
            },
        });

        return this.generateJwtToken(acc.userTag);
    }

    async loginLocal(loginDto: LoginLocalDto) {
        const account = await this.prisma.account.findFirst({
            where: {
                userTag: loginDto.tag,
                type: AccountType.LOCAL,
            },
        });

        // TODO: Timing attacks
        if (account == null)
            throw new BadRequestException({
                code: ERRORS.TAG_OR_PASSWORD_INVALID,
            });

        const passValid = await argon2.verify(
            account.passHash,
            loginDto.password,
        );

        if (!passValid)
            throw new BadRequestException({
                code: ERRORS.TAG_OR_PASSWORD_INVALID,
            });

        return this.generateJwtToken(account.userTag);
    }
}
