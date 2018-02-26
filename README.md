Peerz
=====

### Goals:

0. UDP hole punching
0. Time and version synchronization
0. Connection principles
0. Message propagation by all to all principle
0. Re-building network by some signal, like same time on all machines
0. Json/BSON based protocol

#### UDP hole punching

For first connections we should have the known list of possibly static working peers, which always online and have the static address.
It's one way to do hole punching. For decrease number of the packets and commands we can use for hole punching some useful command.
As example of this command can be the time synchronization commands. Which we will re-send again and again, support punched hole and make useful work in same time.

#### Time and version synchronization

For time, version and network synchronization we should use some simple, lightweight packet.
As example it can be the [ hid, current_time, version, network_id ], so peers can decline other peers if version is old, or network id is wrong.

###### Time synchronization
0. [ hid, current_time, version, network_id, ping:(-1) ], sends to peers and stored time of sent
0. peers when receive time-sync packet, do the same but for itself
0. initial peer, receive it, calculate ping/2, and send [ current_time, version, network_id, ping:(calculated-value) ]
0. second peer, do the same
0. So now both peer have average ping timeout for both side
0. Initial peer use current_time from second peer + (ping1/2+ping2/2)/2 as it self time
0. Second peer just store (ping1+ping2)/4 as the time shift for specified peer


###### version and network synchronization
If it is not the same, server will response with the error

#### Connections principle
As I expect this module can be used for really big systems, we can have big network structure we should have mechanism the limitation of network connections, but have the propagation messages by all to all principle. After time synchronization peer have to request addr list. But second peer should not only send peers known for it, but also should send this request(with addr of ip receiver), to several known for it peers(maybe using some kind of jumpers flag, count of addr etc). After peer have received special request, it gets known for it peers and send it to receiver.
As idea : time sync should be done only on the first connection with stun server(selected from the known peer)
All new known peers should be stored on the disk and used in future as other stun server

# Frame
Frame is data sent/received by/from peers.
Frame have the `header` + [network_id, version, hid, current_time, ping].
and the `body`
This minimum header can be used for checking network_id, version, id of peer and doing time sync.
This is example of the simplest packet.

# Punching Frame
Request : [header]+[ip:port] - address of known peer, known peer can ignore it
Response: [header]+[ip:port] - punched external ip, receiver, should store it

# States of working
0. [idle], no connections, only started listen port, get all information from local data
0. [punching] with the one of known peer
0. if it is no accessible, go to next in list. if nothing to check go to idle
0. if it is okay, getting [connected]
0. [connected] - sending/receiving frames with connected peers, dropped all connection, go to idle, or request count of dropped addresses