/// <reference types="node" />
import { LayerPacket, ProtocolLayer } from "./protocol.layer";
import { Packet } from "./protocol";
export declare class JsonProtocolLayer<I extends LayerPacket, O extends LayerPacket> extends ProtocolLayer<I, O> {
    protected read(packet: Packet): I;
    protected write(layerPacket: O): Buffer;
}
