Goals
=====

Udp like a streams:
- signal - send message without answer
- request - send message and wait answer
- onSignal - on signal handler
- onRequest - on request handler


Protocol:
[magic:4][type:1 byte][id:8byte][len:4byte][data:len]

[MMMM][0][XXXX][..][...] - signal with XXXX id
[MMMM][1][YYYY][..][...] - request with YYYY id
[MMMM][2][ZZZZ][..][...] - response for request with ZZZZ id