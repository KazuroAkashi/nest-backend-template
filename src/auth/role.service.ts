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

    async addRole(role: Role) {
        const prev = await this.prisma.role.findUnique({
            where: { name: role.name },
        });

        if (prev != null)
            throw new BadRequestException({
                code: ERRORS.ROLE_NAMES_MUST_BE_UNIQUE,
            });

        return this.prisma.role.create({
            data: role,
        });
    }

    async countRoleUsers(name: string) {
        return this.prisma.user.count({ where: { roleName: name } });
    }

    async deleteRole(name: string) {
        const userCount = await this.countRoleUsers(name);
        if (userCount > 0)
            throw new BadRequestException({
                code: ERRORS.CANNOT_DELETE_ROLE_WITH_USERS,
            });

        return this.prisma.role.delete({ where: { name } });
    }
}
