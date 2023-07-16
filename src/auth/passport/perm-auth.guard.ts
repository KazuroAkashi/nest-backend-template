import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "@prisma/client";
import { AuthService } from "../auth.service";
import { JwtAuthGuard } from "../passport/jwt-auth.guard";

@Injectable()
export class PermAuthGuard extends JwtAuthGuard {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {
        super();
    }

    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const jwtVerified = await super.canActivate(context);
        if (!jwtVerified) return false;

        const perms = this.reflector.get<Permission[]>(
            "perms",
            context.getHandler(),
        );

        const user = context.switchToHttp().getRequest().user;
        return this.authService.hasPermissions({
            tag: user.tag,
            perms,
        });
    }
}
