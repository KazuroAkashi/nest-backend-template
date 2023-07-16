import { Module, CacheModule } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma.service";
import { UtilModule } from "../util/util.module";
import { CacheService } from "../util/cache.service";
import { JwtStrategy } from "./passport/jwt.strategy";
import { RoleService } from "./role.service";

@Module({
    imports: [PassportModule, JwtModule.register({}), UtilModule],
    providers: [
        AuthService,
        RoleService,
        PrismaService,
        JwtService,
        CacheService,
        JwtStrategy,
    ],
    controllers: [AuthController],
    exports: [AuthService, RoleService],
})
export class AuthModule {}
