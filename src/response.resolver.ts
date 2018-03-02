import {Stream} from "litestream";
import {Packet} from "./protocol";

export interface ResponseHandler{
    timestamp : number;
    counter : number;
    request : Packet;
    callbacks : Function[];
}

export class ResponseResolver extends Stream<Packet>{
    public repeats : Stream<Packet>;

    private _handlers : {[id:number] : ResponseHandler};

    constructor( private _repeatCount : number, private _repeatTimeout : number ){
        super();
        this._handlers = {};
        this.repeats = new Stream<Packet>();
        setInterval(()=>this.validateHandlers(), this._repeatTimeout / 4 );
    }

    private validateHandlers(){
        let ts = Date.now();
        let handlersForRemove : ResponseHandler[] = [];
        for(let id in this._handlers){
            let handler = this._handlers[id];
            if( ts - handler.timestamp >= this._repeatTimeout ){
                handler.timestamp = ts;
                if( handler.counter == 0 ){
                    handler.callbacks[1]();
                    handlersForRemove.push(handler);
                } else {
                    handler.counter--;
                    this.repeats.notify(handler.request);
                }
            }
        }
        
        handlersForRemove.forEach((h)=>{
            delete this._handlers[h.request.id];
        });
    }

    waitResponseFor(requestPacket: Packet) : Promise<Packet> {
        return new Promise<Packet>(( resolve, reject )=>{
            this._handlers[requestPacket.id] = {
                request : requestPacket,
                counter : 3,
                timestamp : Date.now(),
                callbacks : [resolve, reject]
            }
        });
    }

    resolveResponse( responsePacket : Packet ){
        let handler = this._handlers[responsePacket.id];
        if( handler ){
            handler.callbacks[0](responsePacket);
            delete this._handlers[responsePacket.id];
        }
    }

    notify(message: Packet): this {
        this.resolveResponse(message);
        return super.notify(message);
    }
}