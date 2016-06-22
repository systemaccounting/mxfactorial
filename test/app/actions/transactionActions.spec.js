import {
  ADD_TRANSACTION, REMOVE_TRANSACTION, UPDATE_TRANSACTION,
  addTransaction, removeTransaction, updateTransaction
} from 'actions/transactionActions';

describe('transactionActions creator', () => {

  describe('#addTransaction', () => {
    it('should return ADD_TRANSACTION action', () => {
      addTransaction().should.eql({
        type: ADD_TRANSACTION
      });
    });
  });

  describe('#removeTransaction', () => {
    it('should return REMOVE_TRANSACTION action', () => {
      removeTransaction().should.eql({
        type: REMOVE_TRANSACTION
      });
    });
  });

  describe('#updateTransaction', () => {
    it('should return UPDATE_TRANSACTION action', () => {
      const key = 1;
      const field = 'value';
      const value = 30;

      updateTransaction({
        key, field, value
      }).should.eql({
        type: UPDATE_TRANSACTION,
        payload: {
          key, field, value
        }
      });
    });
  });

});
