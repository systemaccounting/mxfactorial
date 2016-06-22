import { transactionAmountSelector } from 'selectors/transaction';

describe('transactionAmountSelector', () => {
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
