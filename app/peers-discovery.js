const WebSocket = require('ws');
const fs = require('fs');
const containerInfo = fs.readFileSync('/etc/hosts', 'utf8');
const containerIP = containerInfo.toString().split(/[\s\n]/)[14];

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

  // callback function updateP2pserver in order to get the peers list
  // inside this discover function
  discover(updateP2pserver) {
    const socket = new WebSocket('ws://' + SERVICE_IP + ':' + LISTENING_PORT);
    
    socket.on('error', () => {
      console.log(`an error accur when connecting to discovery server`);
    });
    socket.on('open', () => {
      this.sendIdentification(socket);
      this.messageHandler(socket, updateP2pserver);
    });
  }

  messageHandler(socket, updateP2pserver) {
  socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.peer_connect:
          this.peers.push({ ip: data.ip, socket});
          // print peers list
          console.log(`New node: ${data.ip} connected.\n
            Now we have:\n
            ${JSON.stringify(this.peers.map(peer => peer.ip))}`);
          this.sendPeersList(data.ip ,socket);
          break;
        case MESSAGE_TYPES.peer_leave:
          this.deletePeerFromList(data.ip);
          this.broadcastList();
          break;
        case MESSAGE_TYPES.peers_list:
          this.updatePeersList(data.list);
          console.log(`Now we receive peers info:\n
            ${JSON.stringify(data.list.map(peer => peer.ip))}`);
            updateP2pserver(data.list.map(peer => peer.ip));
          break;
      }
    });
  }

  sendIdentification(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.peer_connect,
      ip: containerIP
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