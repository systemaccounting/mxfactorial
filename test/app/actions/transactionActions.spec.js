import {
  ADD_TRANSACTION, REMOVE_TRANSACTION, UPDATE_TRANSACTION, UPDATE_CR_ACCOUNT, CLEAR_TRANSACTION, CLEAR_ERROR,
  addTransaction, removeTransaction, updateTransaction, updateCRAccount, clearTransaction, clearError,
  TRANSACT_PATH, POST_TRANSACTION,
  postTransaction
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

  describe('#updateCRAccount', () => {
    it('should return UPDATE_CR_ACCOUNT action', () => {
      updateCRAccount('Sandy').should.eql({
        type: UPDATE_CR_ACCOUNT,
        payload: 'Sandy'
      });
    });
  });

  describe('#clearTransaction', () => {
    it('should return CLEAR_TRANSACTION action', () => {
      clearTransaction().should.eql({
        type: CLEAR_TRANSACTION
      });
    });
  });

  describe('#clearError', () => {
    it('should return CLEAR_ERROR action', () => {
      clearError().should.eql({
        type: CLEAR_ERROR
      });
    });
  });

  describe('#postTransaction', () => {
    it('should return POST_TRANSACTION action', () => {
      const data = { cr_account: 'sandy' };
      postTransaction(data).should.eql({
        type: POST_TRANSACTION,
        payload: {
          request: {
            method: 'POST',
            url: TRANSACT_PATH,
            data
          }
        }
      });
    });
  });
});
