import { transactionAmountSelector, transactionSelector } from 'selectors/transaction';

describe('transaction selector', () => {

  describe('#transactionAmountSelector', () => {
    it('should return correct amount', () => {
      const sampleState = {
        transaction_item: [
          { value: 1, quantity: 2 },
          { value: 2, quantity: 3 }
        ]
      };
      transactionAmountSelector(sampleState).should.equal(8);
    });
  });

  describe('#transactionSelector', () => {
    it('should return correct post value', () => {
      const transaction_item = [
        {
          name: 'chivas',
          value: 100,
          quantity: 1
        }
      ];
      const state = {
        cr_account: 'OOka',
        transaction_item
      };
      const expectedResult = {
        db_author: 'Sandy',
        cr_author: 'OOka',
        db_time: '',
        cr_time: '',
        db_latlng: '0,0',
        cr_latlng: '0,0',
        transaction_item
      };
      transactionSelector(state).should.eql(expectedResult);
    });
  });

});
