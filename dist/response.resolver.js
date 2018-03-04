"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const litestream_1 = require("litestream");
class ResponseResolver extends litestream_1.Stream {
    constructor(_repeatCount, _repeatTimeout) {
        super();
        this._repeatCount = _repeatCount;
        this._repeatTimeout = _repeatTimeout;
        this._handlers = {};
        this.repeats = new litestream_1.Stream();
        setInterval(() => this.validateHandlers(), this._repeatTimeout / 4);
    }
    validateHandlers() {
        let ts = Date.now();
        let handlersForRemove = [];
        for (let id in this._handlers) {
            let handler = this._handlers[id];
            if (ts - handler.timestamp >= this._repeatTimeout) {
                handler.timestamp = ts;
                if (handler.counter == 0) {
                    handler.callbacks[1]();
                    handlersForRemove.push(handler);
                }
                else {
                    handler.counter--;
                    this.repeats.notify(handler.request);
                }
            }
        }
        handlersForRemove.forEach((h) => {
            delete this._handlers[h.request.id];
        });
    }
    waitResponseFor(requestPacket) {
        return new Promise((resolve, reject) => {
            this._handlers[requestPacket.id] = {
                request: requestPacket,
                counter: 3,
                timestamp: Date.now(),
                callbacks: [resolve, reject]
            };
        });
    }
    resolveResponse(responsePacket) {
        let handler = this._handlers[responsePacket.id];
        if (handler) {
            handler.callbacks[0](responsePacket);
            delete this._handlers[responsePacket.id];
        }
    }
    notify(message) {
        this.resolveResponse(message);
        return super.notify(message);
    }
}
exports.ResponseResolver = ResponseResolver;
//# sourceMappingURL=response.resolver.js.map