import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Permission, Role } from "@prisma/client";
import { ERRORS } from "../globals";

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) {}

    fetchRoles() {
        return this.prisma.role.findMany();
    }

    async updateRoles(roles: Role[]) {
        let sumperm = new Set<Permission>();
        let names = new Set<string>();
        for (let role of roles) {
            if (names.has(role.name))
                throw new BadRequestException({
                    code: ERRORS.ROLE_NAMES_MUST_BE_UNIQUE,
                });

            names.add(role.name);

            // Enforce hierarchy in permissions for roles
            for (let perm of role.perms) {
                sumperm.add(perm);
            }

            role.perms = Array.from(sumperm);
        }

        return this.prisma.$transaction([
            this.prisma.role.deleteMany(),
            this.prisma.role.createMany({
                data: roles,
            }),
        ]);
    }
}
