import transaction_item from 'reducers/transaction_item';
import { ADD_TRANSACTION, REMOVE_TRANSACTION, UPDATE_TRANSACTION } from 'actions/transactionActions';

describe('transaction_item reducer', () => {
  const emptyTransaction = {
    item: '',
    value: 0,
    quantity: 0,
    cr_account: ''
  };

  it('should return initial state', () => {
    transaction_item(undefined, {}).should.eql([]);
  });

  it('should handle ADD_TRANSACTION', () => {
    transaction_item([], {
      type: ADD_TRANSACTION
    }).should.eql([emptyTransaction]);
  });

  it('should handle REMOVE_TRANSACTION', () => {
    transaction_item([emptyTransaction], {
      type: REMOVE_TRANSACTION,
      payload: 0
    }).should.eql([]);
  });

  it('should handle ADD_TRANSACTION', () => {
    transaction_item([emptyTransaction], {
      type: UPDATE_TRANSACTION,
      payload: {
        key: 0,
        field: 'value',
        value: 30
      }
    }).should.eql([{
      item: '',
      value: 30,
      quantity: 0,
      cr_account: ''
    }]);
  });

});
