import {Packet, Udp} from "../src";
import {JsonProtocolLayer} from "../src/JsonProtocolLayer";

interface TestPacket{
    packet ?: Packet;
    type:string;
    message : string;
}

describe("2 udp with protocol layer", ()=>{
    let udp1 : Udp;
    let udp2 : Udp;

    let layer1 : JsonProtocolLayer<TestPacket, TestPacket>;
    let layer2 : JsonProtocolLayer<TestPacket, TestPacket>;
    
    beforeEach(()=>{
        udp1 = new Udp(12);
        udp2 = new Udp(12);

        return udp1
            .bind("localhost", 123)
            .then(()=>{
                layer1 = new JsonProtocolLayer<TestPacket, TestPacket>(udp1);
                return udp2.bind("localhost", 124)
                    .then(()=>{
                        layer2 = new JsonProtocolLayer<TestPacket, TestPacket>(udp2);
                    })
            });
    });

    it("should send and receive signal", ()=>{
        return new Promise((resolve)=>{
            layer2.onSignal.subscribe((s)=>{

                expect(s.type).toBe("test-signal");
                expect(s.message).toBe("hello");

                resolve();
            });
            
            
            
            layer1.signal(udp2.boundAddress, { type : "test-signal", message : "hello" });
        });
    });

    it("should send and receive request", ()=>{
        layer1.onRequest.subscribe((s)=>{
            layer1.response(s.packet.address, s, {type:"answer", message : "hello!"});
        });

        return layer2.request(udp1.boundAddress,{type : "quest", message :"Hi!"})
            .then((res)=>{
                expect(res.message).toBe("hello!");
            });
    });

    afterEach(()=>{
        layer1.unbind();
        layer2.unbind();
        udp1.unbind();
        udp2.unbind();
    })
});