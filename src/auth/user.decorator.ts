import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "@prisma/client";

export const ReqUser = createParamDecorator((_, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user as User;
});
