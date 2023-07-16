import {
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "../auth/auth.service";
import { WEBSOCKET_ERRORS } from "../globals";
import { Bunyan, InjectLogger } from "nestjs-bunyan";
import * as E from "fp-ts/Either";
import { EventService } from "./event.service";

@WebSocketGateway({
    cors: {
        origin: "*",
        method: ["GET", "POST"],
    },
})
export class EventGateway implements OnGatewayConnection {
    constructor(
        @InjectLogger() private readonly logger: Bunyan,
        private readonly authService: AuthService,
        private readonly eventService: EventService,
    ) {}

    @WebSocketServer()
    server!: Server;

    async handleConnection(client: Socket, ...args: any[]) {
        this.logger.debug("Connection request received");

        const token = client.handshake.auth.jwt_token;
        if (typeof token !== "string") {
            this.logger.debug("Unauthorized (token wasnt provided)");
            client.emit("unauthorized", {
                code: WEBSOCKET_ERRORS.MALFORMED_CONNECTION_REQUEST, // Malformed connection request
            });
            client.disconnect(true); // Unauthorized
            return;
        }

        // TODO: This should use Either
        const user = await this.authService.findUserByToken(token)();
        if (user._tag === "Left") {
            this.logger.debug(
                { err: user.left },
                "Unauthorized (user not found)",
            );
            client.emit("unauthorized", {
                code: WEBSOCKET_ERRORS.INVALID_TOKEN, // Invalid token
            });
            client.disconnect(true); // Unauthorized
            return;
        }

        this.eventService.registerConnection({
            tag: user.right.tag,
            socket: client,
        });
    }

    @SubscribeMessage("ping")
    handleMessage(client: any, payload: any): string {
        this.logger.debug("Ping message received");
        return "Pong!";
    }
}
