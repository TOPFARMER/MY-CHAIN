const Block = require('./block');

describe('Blcok', () => {
  let data, lastBlock, block;

  beforeEach(() => {
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it('sets the `data` to match the input', () => {
    expect(block.data).toEqual(data);
  });

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  it('generates a hash that mactches the difficulty', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
  });

  it('lowers the difficulties for slowly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty - 1);
  });

  it('raises the difficulties for quickly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty + 1);
  });
});