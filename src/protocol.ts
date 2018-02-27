export class Protocol{
    //[magic:4][type:1 byte][id:8byte][len:4byte][data:len]
    
    read(buffer : Buffer) : Frame{
        let magic = buffer.readUInt32LE(0);
        let type  = buffer.readUIntLE(4, 1);
        let id    = buffer.readUInt32LE(5); //buffer.slice(5, 13).toString('utf-8');
        let len   = buffer.readUInt32LE(12);
        let data;
        if( len > 0 ){
            data  = buffer.slice(17, len);
        } else {
            data  = Buffer.alloc(0);
        }
        return new Frame(magic, type, id, data);
    }
    
    write(frame : Frame):Buffer{
        let buffer = Buffer.alloc(17);
        buffer.writeUInt32LE(frame.magic, 0, true);
        buffer.writeUInt8(frame.type, 4, true);
        buffer.writeUInt32LE(frame.id, 5);
        buffer.writeUInt32LE(frame.data.length, 13, true);
        if( frame.data.length > 0 ){
            buffer = Buffer.concat([buffer, frame.data]);
        }
        return buffer;
    }
    
}

export class Frame{
    constructor(private _magic, private _type : number, private _id : number, private _data : Buffer ){
        
    }
    
    get magic() {
        return this._magic;
    }

    get type(): number {
        return this._type;
    }

    get id(): number {
        return this._id;
    }
    
    get data(): Buffer {
        return this._data;
    }
}