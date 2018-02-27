import {Stream} from "litestream";
import {Frame, Protocol} from "./protocol";

export class FrameIO{
    static SIGNAL : number = 1;
    static REQUEST : number = 2;
    static RESPONSE : number = 3;
    
    private _protocol : Protocol;
    private _input : Stream<Buffer>;
    private _output: Stream<Buffer>;
    
    private _onFrame : Stream<Frame>;
    private _onSignal : Stream<Frame>;
    private _onResponse : Stream<Frame>;
    private _onRequest : Stream<Frame>;
    
    private _id : number = 0;
    
    private _resolvers : {[id:number] : ((arg)=>void)[]};
    
    constructor( private _magic : number ){
        this._protocol = new Protocol();
        this._resolvers = {};
        this._output = new Stream<Buffer>();
        this._input = new Stream<Buffer>();
        
        this._onFrame = this._input.mapTo<Frame>((b)=>{
            try{
                let frame = this._protocol.read(b);
                if( frame.magic == this._magic){
                    return frame;
                }
            }catch (e){}

            return null;
        });
        
        this._onSignal = this._onFrame.when((f)=>f && f.type == FrameIO.SIGNAL);
        this._onResponse = this._onFrame.when((f)=>f && f.type == FrameIO.RESPONSE);
        this._onRequest = this._onFrame.when((f)=>f && f.type == FrameIO.REQUEST);
        
        this._onResponse.subscribe((frame:Frame)=>{
            let r = this._resolvers[frame.id];
            delete this._resolvers[frame.id];
            if( r ){
                r[0](frame);
            }
        });
    }
    
    request( data : Buffer ) : Promise<Frame> {
        return new Promise<Frame>((resolve, reject)=>{
            let frame = new Frame(this._magic, FrameIO.REQUEST, this.nextId, data);
            this.dispatchFrame(frame);
            this._resolvers[frame.id] = [this.wrapResolver(frame, resolve), this.wrapResolver(frame, reject)];
        });
    }
    
    signal( data : Buffer ) : Frame{
        let frame = new Frame(this._magic, FrameIO.SIGNAL, this.nextId, data);
        this.dispatchFrame(frame);
        return frame;
    }
    
    private wrapResolver(frame : Frame, cb : Function ){
        return (arg)=>{
            delete this._resolvers[frame.id];
            cb(arg);
        };
    }
    
    private dispatchFrame(frame : Frame){
        setTimeout(()=>{
            this.output.notify(this.protocol.write(frame));
        }, 10);
    }

    get input(): Stream<Buffer> {
        return this._input;
    }

    get output(): Stream<Buffer> {
        return this._output;
    }
    
    get protocol(): Protocol {
        return this._protocol;
    }
    
    get nextId() {
        this._id++;
        return this._id;
    }
    
    get lastId(){
        return this._id;
    }
}