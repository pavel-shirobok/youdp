"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const litestream_1 = require("litestream");
const response_resolver_1 = require("./response.resolver");
class PacketIO {
    constructor(_magic, repeatCount = 3, repeatTimeout = 1000) {
        this._magic = _magic;
        this._responseResolver = new response_resolver_1.ResponseResolver(repeatCount, repeatTimeout);
        this._input = new litestream_1.Stream();
        this._output = new litestream_1.Stream();
        this._onPacket = this._input.when((packet) => packet.magic == this._magic);
        this._onSignal = this._onPacket.when((f) => f.type == PacketIO.SIGNAL);
        this._onRequest = this._onPacket.when((f) => f.type == PacketIO.REQUEST);
        this._onResponse = this._onPacket.when((f) => f.type == PacketIO.RESPONSE);
        this._onResponse.pipe(this._responseResolver);
        this._responseResolver.repeats.pipe(this.output);
    }
    send(packet) {
        this.dispatchPacket(packet);
        return packet;
    }
    sendAndWait(packet) {
        this.dispatchPacket(packet);
        return this._responseResolver.waitResponseFor(packet);
    }
    dispatchPacket(packet) {
        setTimeout(() => {
            this.output.notify(packet);
        }, 10);
    }
    get input() {
        return this._input;
    }
    get output() {
        return this._output;
    }
    get magic() {
        return this._magic;
    }
    get onPacket() {
        return this._onPacket;
    }
    get onSignal() {
        return this._onSignal;
    }
    get onResponse() {
        return this._onResponse;
    }
    get onRequest() {
        return this._onRequest;
    }
}
PacketIO.SIGNAL = 1;
PacketIO.REQUEST = 2;
PacketIO.RESPONSE = 3;
exports.PacketIO = PacketIO;
//# sourceMappingURL=packet.io.js.map