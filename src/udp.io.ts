import {Stream} from "litestream";
import {Protocol} from "./protocol";

export class UdpIO{
    private _protocol : Protocol;
    private _input : Stream<Buffer>;
    private _output: Stream<Buffer>;
    
    constructor(){
        this._protocol = new Protocol();
        this.initIO();
    }
    
    private initIO(){
        this._output = new Stream<Buffer>();
        this._input = new Stream<Buffer>();
    }
}