import { GET_TRANSACTION_BY_ID } from 'actions/transactionActions';
import { GET_TRANSACTION } from 'actions/transactionActions';
import { generateAsyncTypes } from 'actions/async';
import transactions from 'reducers/transactions';

const { success } = generateAsyncTypes(GET_TRANSACTION_BY_ID);
const getTransactionSuccess = generateAsyncTypes(GET_TRANSACTION).success;

describe('transactions reducer', () => {
  it('should handle GET_TRANSACTION_BY_ID_SUCCESS', () => {
    transactions(undefined, {
      type: success,
      payload: {
        0: {}
      }
    }).should.eql({
      0: {}
    });
  });

  it('should handle GET_TRANSACTION_SUCCESS', () => {
    transactions(undefined, {
      type: getTransactionSuccess,
      payload: {
        0: {}
      }
    }).should.eql({
      0: {}
    });
  });
});
