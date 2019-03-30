const Actor = require('../actor');
const Comment = require('../actor/comment');


/**
 *
 * 区块生成者
 * @class Miner
 */
class Miner {
  constructor(blockchain, commentPool, p2pServer) {
    this.blockchain = blockchain;
    this.commentPool = commentPool;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validComments = this.commentPool.validComments();
    const block = this.blockchain.addBlock(validComments);
    this.p2pServer.syncChain();
    this.commentPool.clear();
    this.p2pServer.broadcastClearComments();

    return block;
  }
}



module.exports = Miner;