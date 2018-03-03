import {Stream} from "litestream";
import {NetworkAddress, Packet} from "./protocol";
import {ResponseResolver} from "./response.resolver";

export class PacketIO{
    static SIGNAL : number = 1;
    static REQUEST : number = 2;
    static RESPONSE : number = 3;
    
    //private _protocol : Protocol;
    private _input : Stream<Packet>;
    private _output: Stream<Packet>;
    
    private _onPacket : Stream<Packet>;
    private _onSignal : Stream<Packet>;
    private _onResponse : Stream<Packet>;
    private _onRequest : Stream<Packet>;
    
    private _responseResolver : ResponseResolver;
    
    constructor( private _magic : number, repeatCount : number = 3, repeatTimeout : number= 1000 ){
        this._responseResolver = new ResponseResolver(repeatCount, repeatTimeout);
        this._input = new Stream<Packet>();
        this._output = new Stream<Packet>();
        
        this._onPacket = this._input.when((packet : Packet)=>packet.magic==this._magic);
        
        this._onSignal   = this._onPacket.when((f)=> f.type == PacketIO.SIGNAL );
        this._onRequest  = this._onPacket.when((f)=> f.type == PacketIO.REQUEST );
        this._onResponse = this._onPacket.when((f)=> f.type == PacketIO.RESPONSE );
        
        this._onResponse.pipe(this._responseResolver);
        this._responseResolver.repeats.pipe(this.output);
    }
    
    request( packet : Packet ) : Promise<Packet> {
        this.dispatchPacket(packet);
        return this._responseResolver.waitResponseFor(packet);
    }
    
    signal( packet : Packet ) : Packet{
        this.dispatchPacket(packet);
        return packet;
    }
    
    private dispatchPacket(packet : Packet){
        setTimeout(()=>{
            this.output.notify(packet);
        }, 10);
    }

    get input(): Stream<Packet> {
        return this._input;
    }

    get output(): Stream<Packet> {
        return this._output;
    }
    
    get magic(){
        return this._magic;
    }
    
    get onPacket(): Stream<Packet> {
        return this._onPacket;
    }

    get onSignal(): Stream<Packet> {
        return this._onSignal;
    }

    get onResponse(): Stream<Packet> {
        return this._onResponse;
    }

    get onRequest(): Stream<Packet> {
        return this._onRequest;
    }
}