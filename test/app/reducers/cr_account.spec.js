import cr_account from 'reducers/cr_account';
import { UPDATE_CR_ACCOUNT, CLEAR_TRANSACTION } from 'actions/transactionActions';

describe('cr_account reducer', () => {
  it('should return initial state', () => {
    cr_account(undefined, {}).should.equal('');
  });

  it('should return initial state', () => {
    cr_account('not empty', {
      type: CLEAR_TRANSACTION
    }).should.equal('');
  });


  it('should handle UPDATE_CR_ACCOUNT', () => {
    const value = 'new_value';
    cr_account('old_value', {
      type: UPDATE_CR_ACCOUNT,
      payload: value
    }).should.equal(value);
  });
});
