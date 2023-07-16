import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventGateway } from "./event.gateway";
import { EventService } from "./event.service";

@Module({
    providers: [EventGateway, EventService],
    imports: [AuthModule],
})
export class EventModule {}
