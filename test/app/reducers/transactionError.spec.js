import transactionError from 'reducers/transactionError';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, CLEAR_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);

describe('transactionError reducer', () => {
  it('should return empty string on initial state', () => {
    transactionError(undefined, {}).should.equal('');
  });

  it('should handle POST_TRANSACTION_FAILURE', () => {
    transactionError(undefined, {
      type: error
    }).should.equal('Transaction failed');
  });

  it('should handle CLEAR_ERROR', () => {
    transactionError('Transaction failed', {
      type: CLEAR_ERROR
    }).should.equal('');
  });

  it('should handle CLEAR_ERROR', () => {
    transactionError('Transaction failed', {
      type: CLEAR_TRANSACTION
    }).should.equal('');
  });
});
