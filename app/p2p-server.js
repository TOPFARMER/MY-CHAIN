// const { NODES_IP } = require('../config');
const Ip = require('ip');
const Websocket = require('ws');
const DnsDiscovery = require('dns-discovery')
const MYIP = Ip.address();
const mDNS_PORT = 27494;

const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transaction: 'CLEAR_TRANSACTION'
}

const P2P_PORT = process.env.P2P_PORT || 5000;

// const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// const peers = () => {
//   const hostIp = Ip.address();
//   const OtherNodesIp = NODES_IP.filter(ip => ip !== hostIp);
//   return OtherNodesIp.map(ws_address => {
//     ws_address = "ws://" + ws_address + ":" + P2P_PORT;
//   });
// };

// const peers = NODES_IP.filter(ip => ip !== Ip.address())
//         .map(ws_address => "ws://" + ws_address + ":" + P2P_PORT);

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
    this.peers = [];
  }

  listen() {

    const listener = DnsDiscovery(); 
    const broadcaster = DnsDiscovery(); 
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));

    listener.on('peer', (name, peer) => {
      if(name === 'block-chain-peer' && peer.host != MYIP) {
        this.peers.push(peer.host);
      }
    });

    this.connectToPeers(this.peers);

    broadcaster.announce('block-chain-peer', mDNS_PORT);

    console.log(`Broadcasting IP address to other peers on ${mDNS_PORT}`);
    console.log(`Listening for peers-to-peers connections on: ${P2P_PORT}`);
  }

  connectToPeers(peers) {
    peers.forEach(peer => {
      const ws_address = "ws://" + peer + ":" + P2P_PORT;
      const socket = new Websocket(ws_address);

      socket.on('error', () => {
        console.log(`an error accur in connecting with peer: ${peer}`);
      });
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected');

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
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }

  broadcastClearTransactions() {
    this.sockets.forEach(socket => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transaction
    })));
  }
}

module.exports = P2pServer;