"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProtocolLayer {
    constructor(_udp) {
        this._udp = _udp;
        this._onPacket = this._udp.io.onPacket.mapTo((packet) => {
            return this.read(packet);
        });
        this._onSignal = this._udp.io.onSignal.mapTo((packet) => {
            return this.read(packet);
        });
        this._onRequest = this._udp.io.onRequest.mapTo((packet) => {
            return this.read(packet);
        });
        this._onResponse = this._udp.io.onResponse.mapTo(p => this.read(p));
    }
    signal(addr, data) {
        let buffer = this.write(data);
        data.packet = this._udp.signal(addr, buffer);
        return data;
    }
    request(addr, data) {
        let buffer = this.write(data);
        return this._udp
            .request(addr, buffer)
            .then((packet) => {
            return this.read(packet);
        });
    }
    response(addr, request, responseData) {
        let buffer = this.write(responseData);
        responseData.packet = this._udp.response(addr, request.packet, buffer);
        return responseData;
    }
    unbind() {
        this._udp.io.onPacket.unpipe(this._onPacket);
        this._udp.io.onRequest.unpipe(this._onRequest);
        this._udp.io.onResponse.unpipe(this._onResponse);
        this._udp.io.onSignal.unpipe(this._onSignal);
        this._udp = null;
    }
    get onResponse() {
        return this._onResponse;
    }
    get onPacket() {
        return this._onPacket;
    }
    get onRequest() {
        return this._onRequest;
    }
    get onSignal() {
        return this._onSignal;
    }
}
exports.ProtocolLayer = ProtocolLayer;
//# sourceMappingURL=protocol.layer.js.map