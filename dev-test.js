const ChainUtil = require('./chain-util');

class DevTest {
  static genCommentFragment() {
    return {
      accessment: { behave: 'good', evaluation: 'good', comment: 'keep going' },
      accountAddr: 'foo-receive-addr'
    };
  }
  
  static genComment(keyPair) {
    const contents = [ DevTest.genComment() ];
    const signature = keyPair.sign(ChainUtil.hash(contents));
    return {
      id: ChainUtil.id(),
      metadata: {
        accountAddr: keyPair.getPublic().encode('hex'),
        signature,
      },
      contents
    };
  }

  static updateComment(comment) {
    const { id, metadata, contents } = comment;
    contents.push(genCommentFragment());
    metadata.signature = keyPair.sign(ChainUtil.hash(comment.contents));
    return { id, metadata, contents };
  }
}

module.exports = DevTest;