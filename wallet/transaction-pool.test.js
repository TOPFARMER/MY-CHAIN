const TransactionPool = require('./transaction-pool');
const Wallet = require('./index');
const Blockchain = require('../blockchain');


describe('TransactioPool', () => {
  let tp, wallet, transaction, bc;
  beforeEach(() => {
    tp = new TransactionPool;
    wallet = new Wallet;
    bc = new Blockchain()
    transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
  });

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
  });
  
  it('updates a transaction to the pool', () => {
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.update(wallet, 'foo-4dddr355', 40);
    tp.updateOrAddTransaction(newTransaction);

    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
      .not.toEqual(oldTransaction);
  });

  it('clears transaction pool', () => {
    tp.clear();
    expect(tp.transactions).toEqual([]);
  });

  describe('mixing valid and corrupt transactions', () => {
    let validTransactions;

    beforeEach(() => {
      validTransactions = [...tp.transactions];

      for(let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
        if(i % 2 == 0) {
          transaction.input.amount = 99999;
        } else {
          validTransactions.push(transaction);
        }
      }
    });


    it('shows a difference between valid and corrupt transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
    });

    it('grabs valid transations', () => {
      expect(JSON.stringify(tp.validTransactions())).toEqual(JSON.stringify(validTransactions));
    });
  });



}); 