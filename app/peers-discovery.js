const WebSocket = require('ws');
const ip = require('ip');
const WaitPort = require('wait-port');

const SERVICE_IP = '149.129.116.62';
const LISTENING_PORT = 30000;

const MESSAGE_TYPES = {
  peer_connect: 'PEER_CONNECT',
  peer_leave: 'PEERS_LEAVE',
  peers_list:'PEERS_LIST'
}

class PeersDiscovery {
  constructor() {
    // peer = { ip, socket }
    this.peers = [];
  }

  listen() {
    const server = new WebSocket.Server({ port: LISTENING_PORT });
    server.on('connection', socket => this.messageHandler(socket));
    console.log(`Listening for peers connection on port: ${ LISTENING_PORT }`);
  }

  discover() {
    // waiting for the peers recording service ready
    WaitPort({
      host: SERVICE_IP,
      port: LISTENING_PORT,
    }).then((open) => {
      if(open) {
        console.log('Discovry server is available')

        const socket = new WebSocket('ws://' + SERVICE_IP + ':' + LISTENING_PORT);
        
        socket.on('error', () => {
          console.log(`an error accur when connecting to discovery server`);
        });
        socket.on('open', () => {
          this.sendIdentification(socket);
          this.messageHandler(socket);
        });
      }
      else console.log('Discovery server is not running before timeout...');
    }).catch((err) => {
      console.err(`An unknown error occured while waiting for the port: ${err}`)
    });
  }

  messageHandler(socket) {
  socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.peer_connect:
          this.peers.push({ ip: data.ip, socket});
          this.sendPeersList(data.ip ,socket);
          break;
        case MESSAGE_TYPES.peer_leave:
          this.deletePeerFromList(data.ip);
          this.broadcastList();
          break;
        case MESSAGE_TYPES.peers_list:
          this.updatePeersList(data.list);
          break;
      }
    });
  }

  sendIdentification(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.peer_connect,
      ip: ip.address()
    }));
  }

  // send peers list to a node using socket to specify
  sendPeersList(ip ,socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.peers_list,
      list: this.peers.filter(peer => peer.ip !== ip)
    }));
  }

  deletePeerFromList(ip) {
    this.peers = this.peers.filter(peer => peer.ip !== ip);
  }

  broadcastList() {
    this.peers.forEach(peer => {
      this.sendPeersList(peer.ip ,peer.socket);
    });
  }

  updatePeersList(list) {
    this.peers = list;
  }
}

module.exports = PeersDiscovery;