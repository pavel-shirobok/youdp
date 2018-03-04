import { Stream } from "litestream";
import { Packet } from "./protocol";
export interface ResponseHandler {
    timestamp: number;
    counter: number;
    request: Packet;
    callbacks: Function[];
}
export declare class ResponseResolver extends Stream<Packet> {
    private _repeatCount;
    private _repeatTimeout;
    repeats: Stream<Packet>;
    private _handlers;
    constructor(_repeatCount: number, _repeatTimeout: number);
    private validateHandlers();
    waitResponseFor(requestPacket: Packet): Promise<Packet>;
    resolveResponse(responsePacket: Packet): void;
    notify(message: Packet): this;
}
