const CommentPool = require('./comment-pool');
const Blockchain = require('../blockchain');
const ChainUtil = require('../chain-util');
const DevTest = require('../dev-test');

describe('CommentPool', () => {
  let cp, comment, bc, keyPair;

  beforeEach(() => {
    keyPair = ChainUtil.genKeyPair();
    comment = DevTest.genComment(keyPair);
    cp = new CommentPool();
    bc = new Blockchain();
  });

  it('adds a comment to the pool', () => {
    expect(cp.comments.find(cm => cm.id === comment.id)).toEqual(comment);
  });

  it('updates a comment to the pool', () => {
    const oldComment = JSON.stringify(comment);
    const newComment = Dev
    cp.updateOrAddComment(newComment);

    expect(JSON.stringify(cp.comments.find(cm => cm.id === newComment.id)))
      .not.toEqual(oldComment);
  });

  it('clears comment pool', () => {
    cp.clear();
    expect(cp.comments).toEqual([]);
  });

  describe('mixing valid and corrupt comments', () => {
    let validComments;

    beforeEach(() => {
      validComments = [...cp.comments];

      for(let i = 0; i < 6; i++) {
        keyPair = ChainUtil.genKeyPair();
        comment = DevTest.genComment(keyPair);
        if(i % 2 == 0) {
          comment.metadata.signature = 'foo-signature';
        } else {
          validComments.push(comment);
        }
      }
    });

    it('shows a difference between valid and corrupt comments', () => {
      expect(JSON.stringify(cp.comments)).not.toEqual(JSON.stringify(validComments));
    });

    it('grabs valid transations', () => {
      expect(JSON.stringify(cp.validComments())).toEqual(JSON.stringify(validComments));
    });
  });
});