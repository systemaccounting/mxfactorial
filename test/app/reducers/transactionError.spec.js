import transactionError from 'reducers/transactionError';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, UPDATE_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);

describe('transactionError reducer', () => {
  it('should return empty string on initial state', () => {
    transactionError(undefined, {}).should.equal('');
  });

  it('should handle POST_TRANSACTION_FAILURE', () => {
    transactionError(undefined, {
      type: error,
      payload: { message: 'Incorrect password' } 
    }).should.equal('Incorrect password');
  });

  it('should handle UPDATE_ERROR', () => {
    transactionError('Transaction failed', {
      type: UPDATE_ERROR
    }).should.equal('');
  });

  it('should handle UPDATE_ERROR', () => {
    transactionError('Transaction failed', {
      type: CLEAR_TRANSACTION
    }).should.equal('');
  });
});
