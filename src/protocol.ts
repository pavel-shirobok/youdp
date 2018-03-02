/**
 * [magic:4][type:1 byte][id:8byte][len:4byte][data:len]
 */
export class Protocol{
    
    read(buffer : Buffer, packet : Packet) : Packet{
        packet.packetBuffer = buffer.slice(0, buffer.length);
        packet.magic = buffer.readUInt32LE(0);
        packet.type  = buffer.readUIntLE(4, 1);
        packet.id    = buffer.readUInt32LE(5);
        let len   = buffer.readUInt32LE(12);
        if( len > 0 ){
            packet.data  = buffer.slice(17, len);
        } else {
            packet.data  = Buffer.alloc(0);
        }
        return packet
    }
    
    write(packet : Packet) : Buffer{
        let buffer = Buffer.alloc(17);
        buffer.writeUInt32LE(packet.magic, 0, true);
        buffer.writeUInt8(packet.type, 4, true);
        buffer.writeUInt32LE(packet.id, 5);
        buffer.writeUInt32LE(packet.data.length, 13, true);
        if( packet.data.length > 0 ){
            buffer = Buffer.concat([buffer, packet.data]);
        }
        return buffer;
    }
    
}

export class Packet {
    static create(addr : NetworkAddress, magic : number, type : number, id : number, data : Buffer){
        let packet = new Packet(addr);
        packet.magic = magic;
        packet.type = type;
        packet.id = id;
        packet.data = data;
        return packet;
    }
    
    magic : number;
    type : number;
    id : number;
    data : Buffer;
    
    packetBuffer : Buffer;
    
    constructor( private _address : NetworkAddress ){}
        
    fillBy( buffer : Buffer, protocol : Protocol ){
        protocol.read(buffer, this);
    }
    
    updateBuffer( protocol : Protocol ){
        this.packetBuffer = protocol.write(this);
    }
    
    get address(): NetworkAddress {
        return this._address;
    }
}

export class NetworkAddress{
    constructor(private _ip : string, private _port : number){}
    
    get ip(): string {
        return this._ip;
    }

    get port(): number {
        return this._port;
    }
}