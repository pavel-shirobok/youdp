/// <reference types="node" />
import { PacketIO } from "./packet.io";
import { NetworkAddress, Packet } from "./protocol";
export declare class Udp {
    private _magic;
    private _io;
    private _boundAddress;
    private _isBound;
    private _isInBindingProcess;
    private _udp;
    private _protocol;
    private _id;
    constructor(_magic: number);
    bind(ip?: string, port?: number): Promise<any>;
    signal(addr: NetworkAddress, data: Buffer): Packet;
    request(addr: NetworkAddress, data: Buffer): Promise<Packet>;
    response(addr: NetworkAddress, request: Packet, responseData: Buffer): Packet;
    unbind(): void;
    private resolveLocalAddress(ip?, port?);
    private bindUDP();
    readonly nextId: number;
    readonly lastId: number;
    readonly io: PacketIO;
    readonly boundAddress: NetworkAddress;
}
