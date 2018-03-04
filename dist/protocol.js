"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * [magic:4][type:1 byte][id:8byte][len:4byte][data:len]
 */
class Protocol {
    read(buffer, packet) {
        packet.packetBuffer = buffer.slice(0, buffer.length);
        packet.magic = buffer.readUInt32LE(0);
        packet.type = buffer.readUIntLE(4, 1);
        packet.id = buffer.readUInt32LE(5);
        let len = buffer.readUInt32LE(12);
        if (len > 0) {
            packet.data = buffer.slice(17, len);
        }
        else {
            packet.data = Buffer.alloc(0);
        }
        return packet;
    }
    write(packet) {
        let buffer = Buffer.alloc(17);
        buffer.writeUInt32LE(packet.magic, 0, true);
        buffer.writeUInt8(packet.type, 4, true);
        buffer.writeUInt32LE(packet.id, 5);
        buffer.writeUInt32LE(packet.data.length, 13, true);
        if (packet.data.length > 0) {
            buffer = Buffer.concat([buffer, packet.data]);
        }
        return buffer;
    }
}
exports.Protocol = Protocol;
class Packet {
    constructor(_address) {
        this._address = _address;
    }
    static create(addr, magic, type, id, data) {
        let packet = new Packet(addr);
        packet.magic = magic;
        packet.type = type;
        packet.id = id;
        packet.data = data;
        return packet;
    }
    fillBy(buffer, protocol) {
        protocol.read(buffer, this);
    }
    updateBuffer(protocol) {
        this.packetBuffer = protocol.write(this);
    }
    get address() {
        return this._address;
    }
}
exports.Packet = Packet;
class NetworkAddress {
    constructor(_ip, _port) {
        this._ip = _ip;
        this._port = _port;
    }
    get ip() {
        return this._ip;
    }
    get port() {
        return this._port;
    }
}
exports.NetworkAddress = NetworkAddress;
//# sourceMappingURL=protocol.js.map