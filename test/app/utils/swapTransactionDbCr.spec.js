import swapTransactionDbCr from 'utils/swapTransactionDbCr';

describe('swapTransactionDbCr util', () => {
  it('should swap', () => {
    swapTransactionDbCr({
      cr_author: 'user1',
      db_author: 'user2',
      transaction_item: [{
        cr_account: 'user1',
        db_account: 'user2'
      }]
    }).should.eql({
      cr_author: 'user2',
      db_author: 'user1',
      transaction_item: [{
        cr_account: 'user2',
        db_account: 'user1'
      }]
    });
  });
});
