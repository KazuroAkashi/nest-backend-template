import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { Permission } from "@prisma/client";
import { PermAuthGuard } from "./passport/perm-auth.guard";

export const Permissions = (...perms: Permission[]) =>
    applyDecorators(UseGuards(PermAuthGuard), SetMetadata("perms", perms));
