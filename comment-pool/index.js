/**
 * 
 * 评价池
 * @class CommentPool
 */
class CommentPool {
  constructor() {
    /** 存储评价的数组 */
    this.comments = [];
  }
  
  /**
   * 
   * 提交评价
   * @param {Object} comment - 提交的评价
   * @memberof CommentPool
   */
  updateOrAddComment(comment) {
    // 不使用const定义类型，因为const需要指定初始值
    // 检查是否存在该评价，存在则更新，反之将评价加入评价池
    let commentWithId = this.comments.find(t => t.id === comment.id);
    if(commentWithId) {
      this.comments[this.comments.indexOf(commentWithId)] = comment;
    } else {
      this.comments.push(comment);
    }
  }

  /**
   *
   * 检查是否已经存在某位参与者的评价
   * 用以跟踪评价上链进度
   * @param {string} accountAddr 
   * @returns {Obect} 返回该评价
   * @memberof CommentPool
   */
  existingComment(accountAddr) {
    return this.comments.find(comment => comment.metadata.accountAddr === accountAddr);
  }


  /**
   *
   * 抓取评价池中有效的评价
   * @returns {Object[]} 返回存储评价的数组
   * @memberof CommentPool
   */
  validComments() {
    return this.comments.filter(comment => {
      // 验证评价中的数字签名
      if(!ChainUtil.verifySignature(
        comment.metadata.accountAddr,
        comment.metadata.signature,
        ChainUtil.hash(comment.contents)
      )) {
        //eslint-disable-next-line no-console
        console.log(`Invalid signature from ${comment.metadata.accountAddr}.`);
        return;
      }
      return comment;
    });
  }

  /**
   *
   * 清空整个评价池
   * @memberof CommentPool
   */
  clear() {
    this.comments = [];
  }
}

module.exports = CommentPool;
