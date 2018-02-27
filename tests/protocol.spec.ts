import {Frame, Protocol} from "../src/protocol";

describe("protocol", ()=>{
    it("should read header with null data", ()=>{
        //[magic:4][type:1 byte][id:8byte][len:4byte][data:len]
        let buffer = Buffer.alloc(17);//new Buffer([]);
        buffer.writeUInt32LE(2305, 0);
        buffer.writeInt8(13, 4);
        buffer.writeUInt32LE(1234567, 5);
        buffer.writeUInt32LE(0, 13);
        
        let p = new Protocol();
        
        let f = p.read(buffer);
        
        expect(f.magic).toBe(2305);
        expect(f.type).toBe(13);
        expect(f.id).toBe(1234567);
        expect(f.data.length).toBe(0);
    });

    it("should read header with test string data", ()=>{
        //[magic:4][type:1 byte][id:8byte][len:4byte][data:len]
        let buffer = Buffer.alloc(17);//new Buffer([]);
        buffer.writeUInt32LE(2305, 0);
        buffer.writeUInt8(13, 4);
        buffer.writeUInt32LE(1234567, 5);
        
        let data = new Buffer("Test data", "utf-8");
        
        buffer.writeUInt32LE(data.length, 13);
        buffer = Buffer.concat([buffer, data]);
        //console.log(buffer);
        
        let p = new Protocol();
        let f = p.read(buffer);

        expect(f.magic).toBe(2305);
        expect(f.type).toBe(13);
        expect(f.id).toBe(1234567);
        expect(f.data.length).toBe(data.length);
        expect(f.data.toString()).toBe("Test data");
    });
    
    it("should write and read frame", ()=>{
        let f = new Frame(23051989, 123, 123456, Buffer.from("Hi!"));
        let p = new Protocol();
        let b = p.write(f);
        
        let f2 = p.read(b);

        expect(f.magic).toBe(f2.magic);
        expect(f.type).toBe(f2.type);
        expect(f.id).toBe(f2.id);
        expect(f.data.length).toBe(f2.data.length);
        expect(f.data.toString()).toBe(f2.data.toString());
    });
});