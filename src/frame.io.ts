import {Stream} from "litestream";
import {Frame, Protocol} from "./protocol";
import {ResponseResolver} from "./response.resolver";

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
    
    private _responseResolver : ResponseResolver;
    
    constructor( private _magic : number, repeatCount : number = 3, repeatTimeout : number= 1000 ){
        this._responseResolver = new ResponseResolver(repeatCount, repeatTimeout);
        this._protocol = new Protocol();
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
        
        this._onResponse.pipe(this._responseResolver);
        this._responseResolver
            .repeats.mapTo((frame)=>this.protocol.write(frame))
            .pipe(this.output);
    }
    
    request( data : Buffer ) : Promise<Frame> {
        let frame = new Frame(this._magic, FrameIO.REQUEST, this.nextId, data);
        this.dispatchFrame(frame);
        return this._responseResolver.waitResponseFor(frame);
    }
    
    signal( data : Buffer ) : Frame{
        let frame = new Frame(this._magic, FrameIO.SIGNAL, this.nextId, data);
        this.dispatchFrame(frame);
        return frame;
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
        if( this._id == Number.MAX_SAFE_INTEGER ){
            this._id = 0;
        } else {
            this._id ++;
        }
        return this._id;
    }
    
    get lastId(){
        return this._id;
    }
}