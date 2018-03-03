import {ResponseResolver} from "../src";
import {Packet} from "../src";

describe("response.resolver", ()=>{
    
    let resolver : ResponseResolver;
    
    beforeEach(()=>{
        resolver = new ResponseResolver(3, 100);
    });
    
    it("should resolve response", ()=>{
       let f = Packet.create(null, 1, 0, 1, Buffer.from([]));//new Frame(1, 0, 1, Buffer.from([]));
       
       setTimeout(()=>{
           resolver.resolveResponse( Packet.create(null, 1, 1, 1, Buffer.from([])) );
       }, 50 );
       
       return resolver
           .waitResponseFor(f)
           .then((resp)=>{
               
               expect(resp.id).toBe(1);
               expect(resp.type).toBe(1);
               expect(resp.magic).toBe(1);
           })
    });

    it("should re-send message twice if timeout is exceed", ()=>{
        let count = 0;
        resolver.repeats.subscribe(()=>{
            count++;
        });
        
        setTimeout(()=>{
            resolver.resolveResponse( Packet.create(null,1, 1, 1, Buffer.from([])) );
        }, 250);
        
        return resolver
            .waitResponseFor(Packet.create(null,1, 0, 1, Buffer.from([])))
            .then((resp)=>{ 
                
                expect(count).toBe(2);
                expect(resp.id).toBe(1);
                expect(resp.type).toBe(1);
                expect(resp.magic).toBe(1);
            });
    });

    it("should reject request if timeout and repeats are exceeded", ()=>{

        let count = 0;
        resolver
            .repeats
            .subscribe(()=>{
                count++;
            });

        return resolver
            .waitResponseFor(Packet.create(null,1, 0, 1, Buffer.from([])))
            .catch(()=>{
                expect(count).toBe(3);
            });
    });
});