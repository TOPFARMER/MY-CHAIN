const Websocket = require('ws');
const PeerDiscovery = require('./peers-discovery');


const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transaction: 'CLEAR_TRANSACTION',
}

const P2P_PORT = process.env.P2P_PORT || 5000;

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.peerDiscovery = new PeerDiscovery();
    this.peers = [];
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });

    // req.connection.remoteAddress return an ipv6 address
    // which map an ipv4 address to ::ffff:[ipv4_address]
    server.on('connection', (socket, req) => 
      this.connectSocket(socket, req.connection.remoteAddress.substring(7)));

    this.connectToPeers();

    console.log(`Listening for peers-to-peers connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    //peer discovery is listening to the discovery server
    this.peerDiscovery.discover(peers => {
      

      console.log(`peers: \n ${JSON.stringify(this.peers)}`);

      peers.forEach(peer => {
        const ws_address = "ws://" + peer + ":" + P2P_PORT;
        const socket = new Websocket(ws_address);
  
        socket.on('error', () => {console
          .log(`an error accur in connecting with peer: ${peer}`)});
        socket.on('open', () => this.connectSocket(socket, peer));
      });
    }); 
  }

  connectSocket(socket, ip) {
    this.peers.push(new Object({
      ip,
      socket
    }));

    console.log(`Socket:${ip} connected`);


    this.messageHandler(socket);
    this.sendChain(socket);
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction :
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transaction :
          this.transactionPool.clear();
          break;
      }
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      // es6 (key: value) shorthand
      // with property value shorthand
      // syntax, you can omit the property
      // value if key matches variable
      // name
      transaction
    }));
  }

  syncChain() {
    this.peers.forEach(peer => this.sendChain(peer.socket));
  }

  broadcastTransaction(transaction) {
    this.peers.forEach(peer => this.sendTransaction(peer.socket, transaction));
  }

  broadcastClearTransactions() {
    this.peers.forEach(peer => peer.socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transaction
    })));
  }
}

module.exports = P2pServer;