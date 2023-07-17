import { CacheModule, Module, OnModuleInit } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BunyanLoggerModule } from "nestjs-bunyan";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./prisma.service";
import { EventModule } from "./event/event.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import chalk from "chalk";
import { UtilModule } from "./util/util.module";
import { RoleService } from "./auth/role.service";

@Module({
    imports: [
        BunyanLoggerModule.forRoot({
            isGlobal: true,
            isEnableRequestLogger: true,
            bunyan: {
                name: "nest",
                streams: [
                    {
                        level: "error",
                        path: "error.log",
                    },
                    // TODO: Better logging to console
                    process.env.NODE_ENV !== "production"
                        ? {
                              stream: {
                                  write,
                              },
                              level: "debug",
                          }
                        : {},
                ],
            },
        }),
        AuthModule,
        EventModule,
        UtilModule,
        EventEmitterModule.forRoot(),
        CacheModule.register({
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
    exports: [PrismaService],
})
export class AppModule implements OnModuleInit {
    constructor(private readonly roleService: RoleService) {}

    onModuleInit() {
        this.roleService.addRole({ name: "Default", perms: [] }); // Don't do anything on error
    }
}

function write(objParam: Object) {
    const obj = JSON.parse(objParam.toString());
    const lines = JSON.stringify(obj, null, 2);

    let msgColor;
    switch (obj.level) {
        case 10:
        case 20:
            msgColor = chalk.black.bgWhite;
            break;
        case 30:
            msgColor = chalk.bgBlueBright.black;
            break;
        case 40:
            msgColor = chalk.bgYellow.black;
            break;
        case 50:
        case 60:
            msgColor = chalk.bgRed.black;
            break;
        default:
            msgColor = chalk.bgRed.black;
            break;
    }

    console.log(lines.replace(/("msg": (?:.*?)),/g, msgColor.bold("$1")));
}
