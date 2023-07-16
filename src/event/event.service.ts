import { Injectable } from "@nestjs/common";
import { number } from "fp-ts";
import { Server, Socket } from "socket.io";
import { Events } from "../globals";

@Injectable()
export class EventService {
    private readonly userSockets = new Map<string, Socket>();
    //private readonly socketUsers = new Map<string, number>();

    registerConnection({ tag, socket }: { tag: string; socket: Socket }) {
        this.userSockets.set(tag, socket);
        //this.socketUsers.set(socketId, userId);
    }

    send({
        tag,
        event,
        data,
    }: {
        tag: string;
        event: Events;
        data: any;
    }): boolean {
        const socket = this.userSockets.get(tag);
        if (!socket) return false;

        socket.emit(event, data);
        return true;
    }
}
