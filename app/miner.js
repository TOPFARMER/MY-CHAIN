class Miner {
    constructor(blockchain, tranactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.tranactionPool = tranactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        
    }
}



module.exports = Miner;