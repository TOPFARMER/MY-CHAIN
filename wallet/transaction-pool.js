const Transaction = require('./transaction');

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

    validTransactions() {
        return this.transactions.filter(transaction => {
            // should have a constraint that the number come from a transaction 
            // should be in num type not other type like string
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);

            if(transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}. 
                total: ${outputTotal} input: ${transaction.input.amount}`);
                return;
            }

            if(!Transaction.verifyTransation(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return;
            }

            return transaction;
        });
    }

    clear() {
        this.transactions = [];
    }
}

module.exports = TransactionPool;