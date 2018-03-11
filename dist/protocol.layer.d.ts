/// <reference types="node" />
import { NetworkAddress, Packet } from "./protocol";
import { Udp } from "./udp";
import { Stream } from "litestream";
export interface LayerPacket {
    packet?: Packet;
}
export declare abstract class ProtocolLayer<I extends LayerPacket, O extends LayerPacket> {
    protected _udp: Udp;
    private _onPacket;
    private _onSignal;
    private _onRequest;
    private _onResponse;
    constructor(_udp: Udp);
    signal(addr: NetworkAddress, data: O): O;
    request(addr: NetworkAddress, data: O): Promise<I>;
    response(addr: NetworkAddress, request: I, responseData: O): O;
    unbind(): void;
    protected abstract read(packet: Packet): I;
    protected abstract write(layerPacket: O): Buffer;
    readonly onResponse: Stream<I>;
    readonly onPacket: Stream<I>;
    readonly onRequest: Stream<I>;
    readonly onSignal: Stream<I>;
}
