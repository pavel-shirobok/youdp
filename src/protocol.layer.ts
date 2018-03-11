import {NetworkAddress, Packet} from "./protocol";
import {Udp} from "./udp";
import {Stream} from "litestream";

export interface LayerPacket { packet ?: Packet; }

export abstract class ProtocolLayer<I extends LayerPacket, O extends LayerPacket>{
    private _onPacket   : Stream<I>;
    private _onSignal   : Stream<I>;
    private _onRequest  : Stream<I>;
    private _onResponse : Stream<I>;
    
    constructor(protected _udp : Udp) {
        this._onPacket = this._udp.io.onPacket.mapTo<I>((packet : Packet)=>{
            return this.read(packet)    
        });
        
        this._onSignal = this._udp.io.onSignal.mapTo<I>((packet : Packet)=>{
            return this.read(packet);
        });
        
        this._onRequest = this._udp.io.onRequest.mapTo<I>((packet:Packet)=>{
            return this.read(packet);
        });
        
        this._onResponse = this._udp.io.onResponse.mapTo<I>(p=>this.read(p));
    }

    signal(addr : NetworkAddress, data : O ) : O {
        let buffer = this.write(data);
        data.packet = this._udp.signal(addr, buffer);
        return data;
    }

    request(addr : NetworkAddress, data : O ) : Promise<I> {
        let buffer = this.write(data);
        return this._udp
            .request(addr, buffer)
            .then((packet : Packet)=>{
                return this.read(packet);
            });
    }

    response(addr : NetworkAddress, request : I, responseData : O) : O{
        let buffer = this.write(responseData);
        responseData.packet = this._udp.response(addr, request.packet, buffer);
        return responseData;
    }
    
    unbind(){
        this._udp.io.onPacket.unpipe(<any>this._onPacket);
        this._udp.io.onRequest.unpipe(<any>this._onRequest);
        this._udp.io.onResponse.unpipe(<any>this._onResponse);
        this._udp.io.onSignal.unpipe(<any>this._onSignal);
        this._udp = null;
    }
    
    protected abstract read( packet : Packet ) : I;
    
    protected abstract write(layerPacket : O) : Buffer;


    get onResponse(): Stream<I>{
        return this._onResponse;
    }

    get onPacket(): Stream<I>{
        return this._onPacket;
    }

    get onRequest(): Stream<I>{
        return this._onRequest;
    }

    get onSignal(): Stream<I>{
        return this._onSignal;
    }
    
}