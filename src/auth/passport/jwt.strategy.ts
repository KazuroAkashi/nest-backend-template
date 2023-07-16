import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "src/types";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || "123",
        });
    }

    async validate(payload: JwtPayload): Promise<User | null> {
        const user = await this.authService.findUserByTagOrThrow(payload.tag);
        if (!user) return null;

        return user;
    }
}
