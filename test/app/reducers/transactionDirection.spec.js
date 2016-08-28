import { SET_TRANSACTION_DIRECTION } from 'actions/transactionActions';
import transactionDirection from 'reducers/transactionDirection';

describe('transactionDirection reducer', () => {
  it('should handle SET_TRANSACTION_DIRECTION', () => {
    transactionDirection(undefined, {
      type: SET_TRANSACTION_DIRECTION,
      payload: 'credit'
    }).should.eql('credit');
  });
});
