import {Frame} from "./protocol";
import {Stream} from "litestream";

export interface ResponseHandler{
    timestamp : number;
    counter : number;
    request : Frame;
    callbacks : Function[];
}

export class ResponseResolver extends Stream<Frame>{
    public repeats : Stream<Frame>;

    private _handlers : {[id:number] : ResponseHandler};

    constructor( private _repeatCount : number, private _repeatTimeout : number ){
        super();
        this._handlers = {};
        this.repeats = new Stream<Frame>();
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

    waitResponseFor(requestFrame: Frame) : Promise<Frame> {
        return new Promise<Frame>(( resolve, reject )=>{
            this._handlers[requestFrame.id] = {
                request : requestFrame,
                counter : 3,
                timestamp : Date.now(),
                callbacks : [resolve, reject]
            }
        });
    }

    resolveResponse( responseFrame : Frame ){
        let handler = this._handlers[responseFrame.id];
        if( handler ){
            handler.callbacks[0](responseFrame);
            delete this._handlers[responseFrame.id];
        }
    }

    notify(message: Frame): this {
        this.resolveResponse(message);
        return super.notify(message);
    }
}