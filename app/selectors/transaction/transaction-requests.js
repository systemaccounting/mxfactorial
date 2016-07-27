import { createSelector } from 'reselect';
import moment from 'moment';
import pickBy from 'lodash/pickBy';

const getTransactions = (state) => (state.transactions);

const getRequestFilter = (state) => (state.requestsFilter);

const filterFunction = {
  active: (transaction) => (!transaction.rejected_time &&
    (!transaction.expiration_time ||
      moment().isBefore(moment(transaction.expiration_time))
    )
  ),

  rejected: (transaction) => ( transaction.rejected_time ||
    (transaction.expiration_time &&
      moment().isSameOrAfter(moment(transaction.expiration_time))
    )
  )
};

export const requestTransactionSelector = createSelector([getTransactions, getRequestFilter],
  (transactions, requestsFilter) => (
    pickBy(transactions, filterFunction[requestsFilter])
  )
);
