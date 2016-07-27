import transaction_item from 'reducers/transaction_item';
import {
  ADD_TRANSACTION, REMOVE_TRANSACTION, UPDATE_TRANSACTION, CLEAR_TRANSACTION, UPDATE_CR_ACCOUNT
} from 'actions/transactionActions';
import { GET_EMPTY_TRANSACTION } from 'constants/index';

describe('transaction_item reducer', () => {
  const emptyTransaction = GET_EMPTY_TRANSACTION(0);

  it('should return initial state', () => {
    transaction_item(undefined, {}).should.eql([]);
  });

  it('should handle ADD_TRANSACTION', () => {
    const cr_account = '';
    const newTransaction = GET_EMPTY_TRANSACTION(0, { cr_account });
    transaction_item([], {
      type: ADD_TRANSACTION,
      payload: cr_account
    }).should.eql([newTransaction]);
  });

  it('should handle REMOVE_TRANSACTION', () => {
    transaction_item([emptyTransaction], {
      type: REMOVE_TRANSACTION,
      payload: 0
    }).should.eql([]);
  });

  it('should handle CLEAR_TRANSACTION', () => {
    transaction_item([emptyTransaction], {
      type: CLEAR_TRANSACTION,
      payload: 0
    }).should.eql([]);
  });

  it('should handle UPDATE_TRANSACTION', () => {
    transaction_item([emptyTransaction], {
      type: UPDATE_TRANSACTION,
      payload: {
        key: 0,
        field: 'value',
        value: 30
      }
    }).should.eql([{
      key: 0,
      name: '',
      value: 30,
      quantity: 0,
      cr_account: '',
      db_account: '',
      units_measured: '',
      unit_of_measurement: ''
    }]);
  });

  it('should handle UPDATE_CR_ACCOUNT', () => {
    transaction_item([GET_EMPTY_TRANSACTION(0)], {
      type: UPDATE_CR_ACCOUNT,
      payload: 'David'
    }).should.eql([{
      key: 0,
      name: '',
      value: 0,
      quantity: 0,
      cr_account: 'David',
      db_account: '',
      units_measured: '',
      unit_of_measurement: ''
    }]);
  });

});
