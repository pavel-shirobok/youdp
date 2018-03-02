import {PacketIO} from "../src";
import {Packet} from "../src";

describe("packet.io", ()=>{
    
    it("should output packet signal", ()=>{
        return new Promise((resolve)=>{
            let io = new PacketIO(12);
            let f = io.signal(Packet.create(null, 12,1,1, Buffer.from("test")));
            
            io.output.subscribe((rFrame : Packet)=>{
                //let rFrame = //io.protocol.read(buffer);
                
                expect(rFrame.id).toBe(f.id);
                expect(rFrame.magic).toBe(f.magic);
                expect(rFrame.magic).toBe(12);
                expect(rFrame.type).toBe(f.type);
                expect(rFrame.type).toBe(PacketIO.SIGNAL);
                expect(rFrame.data.toString()).toBe(f.data.toString());
                expect(rFrame.data.toString()).toBe("test");
                
                resolve();
            });
        });
    });
    
    it("should output frame request", ()=>{
        return new Promise((resolve)=>{
            let io = new PacketIO(12);
            io.request(Packet.create(null, 12, PacketIO.REQUEST, 1, Buffer.from("test")));

            io.output.subscribe((rFrame)=>{
                //let rFrame = io.protocol.read(buffer);
                expect(rFrame.magic).toBe(12);
                expect(rFrame.type).toBe(PacketIO.REQUEST);
                expect(rFrame.data.toString()).toBe("test");
                resolve();
            });
        });
    });

    it("should receive response", ()=>{
        let io = new PacketIO(12);
        
        io.output.subscribe((packet : Packet)=>{
            io.input.notify(Packet.create(null, packet.magic, PacketIO.RESPONSE, packet.id, Buffer.from("hi, lobster")) );
        });
        
        return io
            .request(Packet.create(null, 12, PacketIO.REQUEST, 1, Buffer.from("hello, crab")))
            .then((frame)=>{
                expect(frame.data.toString()).toBe("hi, lobster");
            });
    });

    it("should receive response with delay", ()=>{
        let io = new PacketIO(12);

        io.output.subscribe((packet)=>{
            
            setTimeout(()=>{
                //let frame = io.protocol.read(b);
                let response = Packet.create(null,12, PacketIO.RESPONSE, packet.id, Buffer.from("hi, lobster") );
                io.input.notify(response );
            }, 500);
        });

        return io
            .request(Packet.create(null,12, PacketIO.REQUEST, 1, Buffer.from("hello, crab") ))
            .then((frame)=>{
                expect(frame.data.toString()).toBe("hi, lobster");
            });
    });
});