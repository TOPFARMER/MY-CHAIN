const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Actor = require('../actor');
const CommentPool = require('../actor/comment-pool')
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3000;


const app = express();
const bc = new Blockchain();
const cp = new CommentPool();
const p2pServer = new P2pServer(bc, cp);
const miner = new Miner(bc, cp, p2pServer);

app.use(bodyParser.json());

// 获取区块链
app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

// 从评价池中获取评价
app.get('/comments', (req, res) => {
  res.json(cp.comments);
});

app.get('/mine-comments', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
  const { key, receiveAddr, assessment } = req.body;
  const actor = new Actor(key.pub, key.priv);
  const comment = actor.createComment(receiveAddr, assessment, bc, cp);
  p2pServer.broadcastComment(comment);
  res.redirect('/comments');
});


app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();