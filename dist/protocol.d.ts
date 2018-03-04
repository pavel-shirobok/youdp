/// <reference types="node" />
/**
 * [magic:4][type:1 byte][id:8byte][len:4byte][data:len]
 */
export declare class Protocol {
    read(buffer: Buffer, packet: Packet): Packet;
    write(packet: Packet): Buffer;
}
export declare class Packet {
    private _address;
    static create(addr: NetworkAddress, magic: number, type: number, id: number, data: Buffer): Packet;
    magic: number;
    type: number;
    id: number;
    data: Buffer;
    packetBuffer: Buffer;
    constructor(_address: NetworkAddress);
    fillBy(buffer: Buffer, protocol: Protocol): void;
    updateBuffer(protocol: Protocol): void;
    readonly address: NetworkAddress;
}
export declare class NetworkAddress {
    private _ip;
    private _port;
    constructor(_ip: string, _port: number);
    readonly ip: string;
    readonly port: number;
}
