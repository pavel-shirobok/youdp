import { Stream } from "litestream";
import { Packet } from "./protocol";
export declare class PacketIO {
    private _magic;
    static SIGNAL: number;
    static REQUEST: number;
    static RESPONSE: number;
    private _input;
    private _output;
    private _onPacket;
    private _onSignal;
    private _onResponse;
    private _onRequest;
    private _responseResolver;
    constructor(_magic: number, repeatCount?: number, repeatTimeout?: number);
    send(packet: Packet): Packet;
    sendAndWait(packet: Packet): Promise<Packet>;
    private dispatchPacket(packet);
    readonly input: Stream<Packet>;
    readonly output: Stream<Packet>;
    readonly magic: number;
    readonly onPacket: Stream<Packet>;
    readonly onSignal: Stream<Packet>;
    readonly onResponse: Stream<Packet>;
    readonly onRequest: Stream<Packet>;
}
