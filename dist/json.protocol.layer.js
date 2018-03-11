"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protocol_layer_1 = require("./protocol.layer");
class JsonProtocolLayer extends protocol_layer_1.ProtocolLayer {
    read(packet) {
        let jsonString = packet.data.toString("utf-8");
        let json = JSON.parse(jsonString);
        json.packet = packet;
        return json;
    }
    write(layerPacket) {
        let json = JSON.parse(JSON.stringify(layerPacket));
        delete json["packet"];
        return Buffer.from(JSON.stringify(json));
    }
}
exports.JsonProtocolLayer = JsonProtocolLayer;
//# sourceMappingURL=json.protocol.layer.js.map