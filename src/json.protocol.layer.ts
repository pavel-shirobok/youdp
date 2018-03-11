import {LayerPacket, ProtocolLayer} from "./protocol.layer";
import {Packet} from "./protocol";

export class JsonProtocolLayer<I extends LayerPacket, O extends LayerPacket> extends ProtocolLayer<I, O>{

    protected read(packet: Packet): I {
        let jsonString = packet.data.toString("utf-8");
        let json = JSON.parse(jsonString);
        json.packet = packet;
        return json;
    }

    protected write(layerPacket : O): Buffer {
        let json = JSON.parse(JSON.stringify(layerPacket));
        delete json["packet"];
        return Buffer.from(JSON.stringify(json));
    }
}