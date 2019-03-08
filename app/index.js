const express = require('express');
const bodyParser = require('body-parser');
const WaitPort = require('wait-port');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool')
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3000;


const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChain();

  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);

  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

app.get('/public-key', (req,res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('/ip', (req,res) => {
  res.json(p2pServer.peers);
});


// waiting for the peers recording service ready
WaitPort({
  host: '149.129.116.62',
  port: 30000,
}).then((open) => {
  if(open) {
    console.log('Discovery server is available\nMychain is running')

    app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
    p2pServer.listen();
  }
  else console.log('Discovery server is not running before timeout...');
}).catch((err) => {
  console.err(`An unknown error occured while waiting for the port: ${err}`)
});
