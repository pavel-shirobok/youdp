import {FrameIO} from "../src/frame.io";
import {Frame} from "../src/protocol";

describe("frame.io", ()=>{
    
    it("should output frame signal", ()=>{
        return new Promise((resolve)=>{
            let io = new FrameIO(12);
            let f = io.signal(Buffer.from("test"));
            
            io.output.subscribe((buffer:Buffer)=>{
                let rFrame = io.protocol.read(buffer);
                
                expect(rFrame.id).toBe(f.id);
                expect(rFrame.magic).toBe(f.magic);
                expect(rFrame.magic).toBe(12);
                expect(rFrame.type).toBe(f.type);
                expect(rFrame.type).toBe(FrameIO.SIGNAL);
                expect(rFrame.data.toString()).toBe(f.data.toString());
                expect(rFrame.data.toString()).toBe("test");
                
                resolve();
            });
        });
    });
    
    it("should output frame request", ()=>{
        return new Promise((resolve)=>{
            let io = new FrameIO(12);
            io.request(Buffer.from("test"));

            io.output.subscribe((buffer:Buffer)=>{
                let rFrame = io.protocol.read(buffer);
                expect(rFrame.magic).toBe(12);
                expect(rFrame.type).toBe(FrameIO.REQUEST);
                expect(rFrame.data.toString()).toBe("test");
                resolve();
            });
        });
    });

    it("should receive response", ()=>{
        let io = new FrameIO(12);
        
        io.output.subscribe((b)=>{
            let frame = io.protocol.read(b);
            let response = new Frame(12, FrameIO.RESPONSE, frame.id, Buffer.from("hi, lobster") );
            io.input.notify(io.protocol.write( response ) );
        });
        
        return io
            .request(Buffer.from("hello, crab"))
            .then((frame)=>{
                expect(frame.data.toString()).toBe("hi, lobster");
            });
    });
});