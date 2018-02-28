import {ResponseResolver} from "../src/response.resolver";
import {Frame} from "../src/protocol";

describe("response.resolver", ()=>{
    
    let resolver : ResponseResolver;
    beforeEach(()=>{
        resolver = new ResponseResolver(3, 100);
    });
    
    it("should resolve response", ()=>{
       let f = new Frame(1, 0, 1, Buffer.from([]));
       
       setTimeout(()=>{
           resolver.resolveResponse( new Frame(1, 1, 1, Buffer.from([])) );
       }, 50);
       
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
            resolver.resolveResponse( new Frame(1, 1, 1, Buffer.from([])) );
        }, 210);
        
        return resolver
            .waitResponseFor(new Frame(1, 0, 1, Buffer.from([])))
            .then((resp)=>{ 
                
                expect(count).toBe(2);
                expect(resp.id).toBe(1);
                expect(resp.type).toBe(1);
                expect(resp.magic).toBe(1);
            });
    });

    it("should reject request if timeout and repeats are exceeded", ()=>{

        let count = 0;
        resolver.repeats.subscribe(()=>{
            count++;
        });

        return resolver
            .waitResponseFor(new Frame(1, 0, 1, Buffer.from([])))
            .catch(()=>{
                expect(count).toBe(3);
            });
    });
});