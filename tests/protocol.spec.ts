import {Packet, Protocol} from "../src/protocol";

describe("protocol", ()=>{
    it("should read header with null data", ()=>{
        //[magic:4][type:1 byte][id:8byte][len:4byte][data:len]
        let buffer = Buffer.alloc(17);//new Buffer([]);
        buffer.writeUInt32LE(2305, 0);
        buffer.writeUInt8(13, 4);
        buffer.writeUInt32LE(1234567, 5);
        buffer.writeUInt32LE(0, 13);
        
        let p = new Protocol();
        let pk = new Packet(null);
        let f = p.read(buffer, pk);
        
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
        let pk = new Packet(null);
        let f = p.read(buffer, pk);

        expect(f.magic).toBe(2305);
        expect(f.type).toBe(13);
        expect(f.id).toBe(1234567);
        expect(f.data.length).toBe(data.length);
        expect(f.data.toString()).toBe("Test data");
    });
    
    it("should write and read packet", ()=>{
        //let f = new Frame(23051989, 123, 123456, Buffer.from("Hi!"));
        let pk1 = new Packet(null);
        pk1.magic = 23051989;
        pk1.type = 123;
        pk1.id = 123456;
        pk1.data = Buffer.from("Hi!");
        //pk1.
        
        let p = new Protocol();
        let b = p.write(pk1);
        
        let pk = new Packet(null)
        let f2 = p.read(b, pk);

        expect(pk1.magic).toBe(f2.magic);
        expect(pk1.type).toBe(f2.type);
        expect(pk1.id).toBe(f2.id);
        expect(pk1.data.length).toBe(f2.data.length);
        expect(pk1.data.toString()).toBe(f2.data.toString());
    });
});