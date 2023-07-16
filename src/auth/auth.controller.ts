import { Controller, HttpCode, NotFoundException, Req } from "@nestjs/common";
import { RegisterDto } from "../dto/RegisterLocalDto";
import { AuthService } from "./auth.service";
import { Bunyan, ReqLogger } from "nestjs-bunyan";
import { TypedBody, TypedRoute } from "@nestia/core";
import { Permissions } from "./permissions.decorator";
import { ReqUser } from "./user.decorator";
import { User } from "@prisma/client";
import { LoginDto } from "../dto/LoginLocalDto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ReqLogger()
    private readonly logger!: Bunyan;

    @TypedRoute.Post("register")
    async register(@TypedBody() registerDto: RegisterDto) {
        this.logger.info({ req: registerDto }, "New register request");
        return this.authService.registerLocal(registerDto);
    }

    @TypedRoute.Post("login")
    @HttpCode(200)
    async login(@TypedBody() loginDto: LoginDto) {
        this.logger.info({ req: loginDto }, "New login request");
        return this.authService.loginLocal(loginDto);
    }

    @Permissions()
    @TypedRoute.Get("me")
    async me(@ReqUser() user: User) {
        this.logger.debug({ user }, "Returned user");
        return user;
    }
}
