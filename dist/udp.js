"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const dgram = require("dgram");
const packet_io_1 = require("./packet.io");
const protocol_1 = require("./protocol");
class Udp {
    constructor(_magic) {
        this._magic = _magic;
        this._id = 0;
        this._protocol = new protocol_1.Protocol();
    }
    bind(ip, port) {
        if (this._isBound)
            return Promise.reject(new Error("Already bound"));
        if (this._isInBindingProcess)
            return Promise.reject(new Error("Already in binding progress"));
        this._isInBindingProcess = true;
        this._io = new packet_io_1.PacketIO(this._magic, 3, 1000);
        return this
            .resolveLocalAddress(ip, port)
            .then(() => this.bindUDP())
            .then(() => {
            this._isBound = true;
            this._isInBindingProcess = false;
        })
            .catch((e) => {
            this._isBound = false;
            this._isInBindingProcess = false;
            return Promise.reject(e);
        });
    }
    signal(addr, data) {
        let packet = new protocol_1.Packet(addr);
        packet.magic = this._magic;
        packet.type = packet_io_1.PacketIO.SIGNAL;
        packet.id = this.nextId;
        packet.data = data;
        packet.updateBuffer(this._protocol);
        return this.io.send(packet);
    }
    request(addr, data) {
        let packet = new protocol_1.Packet(addr);
        packet.magic = this._magic;
        packet.type = packet_io_1.PacketIO.REQUEST;
        packet.id = this.nextId;
        packet.data = data;
        packet.updateBuffer(this._protocol);
        return this.io.sendAndWait(packet);
    }
    response(addr, request, responseData) {
        let packet = new protocol_1.Packet(addr);
        packet.magic = this._magic;
        packet.type = packet_io_1.PacketIO.RESPONSE;
        packet.id = request.id;
        packet.data = responseData;
        packet.updateBuffer(this._protocol);
        return this.io.send(packet);
    }
    unbind() {
        if (this._isBound) {
            this._io = null;
            this._udp.close();
            this._udp.removeAllListeners();
            this._isBound = false;
            this._isInBindingProcess = false;
        }
    }
    resolveLocalAddress(ip, port) {
        if (port && ip) {
            this._boundAddress = new protocol_1.NetworkAddress(ip, port);
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            let socket = net.createConnection(80, "google.com");
            socket.on('connect', () => {
                this._boundAddress = new protocol_1.NetworkAddress(socket.address().address, port);
                socket.end();
                socket.removeAllListeners();
                resolve();
            });
            socket.on("error", (e) => {
                socket.removeAllListeners();
                reject(e);
            });
        });
    }
    bindUDP() {
        return new Promise((resolve, reject) => {
            this._udp = dgram.createSocket("udp4");
            this._udp.on("listening", () => {
                resolve();
            });
            this._udp.on("message", (msg, rinfo) => {
                let packet = new protocol_1.Packet(new protocol_1.NetworkAddress(rinfo.address, rinfo.port));
                packet.fillBy(msg, this._protocol);
                this._io.input.notify(packet);
            });
            this._udp.on("error", (e) => {
                if (this._isInBindingProcess) {
                    reject(e);
                }
                else {
                    //TODO
                }
            });
            this._udp.on("close", () => {
                //TODO 
            });
            this._io.output.subscribe((packet) => {
                this._udp.send(packet.packetBuffer, 0, packet.packetBuffer.length, packet.address.port, packet.address.ip);
            });
            this._udp.bind(this.boundAddress.port, this.boundAddress.ip);
        });
    }
    get nextId() {
        if (this._id == Number.MAX_SAFE_INTEGER) {
            this._id = 0;
        }
        else {
            this._id++;
        }
        return this._id;
    }
    get lastId() {
        return this._id;
    }
    get io() {
        return this._io;
    }
    get boundAddress() {
        return this._boundAddress;
    }
}
exports.Udp = Udp;
//# sourceMappingURL=udp.js.map