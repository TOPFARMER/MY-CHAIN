class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        // We don't use const type to define it because const type needs
        // the variable to have a initial value.
        // And both const type and let type can't be reassign but var type can.
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if(transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
      }
}

module.exports = TransactionPool;