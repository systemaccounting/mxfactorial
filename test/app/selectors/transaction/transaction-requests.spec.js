import moment from 'moment';

import { requestTransactionSelector } from 'selectors/transaction/transaction-requests';

describe('requestTransactionSelector', () => {
  const transactions = {
    0: {
      expiration_time: moment().add(1, 'days').format()
    },
    1: {
      rejected_time: moment().format()
    }
  };
  let requestsFilter = 'active';
  const state = {
    transactions,
    requestsFilter
  };

  it('should return correct transaction base on filter', () => {
    requestTransactionSelector(state).should.eql({
      0: transactions[0]
    });
    state.requestsFilter = 'rejected';
    requestTransactionSelector(state).should.eql({
      1: transactions[1]
    });
  });
});
