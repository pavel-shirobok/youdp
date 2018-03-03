import {Udp} from "../src";

xdescribe("udp", ()=>{
    let udp : Udp;
    
    beforeEach(()=>{
        udp = new Udp(12);
    });
    
    it("should bind", ()=>{
        return udp.bind("localhost", 123).then(()=>{
            expect(udp.boundAddress.port).toBe(123);
            expect(udp.boundAddress.ip).toBe("localhost")
        })
    });
    
    afterEach(()=>{
        udp.unbind();
    })
});

describe("2 udp", ()=>{
    let udp1 : Udp;
    let udp2 : Udp;

    beforeEach(()=>{
        udp1 = new Udp(12);
        udp2 = new Udp(12);

        return udp1
            .bind("localhost", 123)
            .then(()=>{
                return udp2.bind("localhost", 124);
            });
    });

    it("should send and receive signal", ()=>{
        return new Promise((resolve)=>{
            udp2.io.onSignal.subscribe((s)=>{
                
                expect(s.magic).toBe(12);
                expect(s.id).toBe(so.id);
                
                resolve();
            });
            
            let so = udp1.signal(udp2.boundAddress, Buffer.from("Hi!"));
        });
    });
    
    it("should send and receive request", ()=>{
        udp2.io.onRequest.subscribe((s)=>{
            udp2.response(s.address, s, Buffer.from("hello!"));
        });

        return udp1.request(udp2.boundAddress, Buffer.from("Hi!"))
            .then((res)=>{
                expect(res.data.toString()).toBe("hello!");
            });
    });

    afterEach(()=>{
        udp1.unbind();
        udp2.unbind();
    })
});