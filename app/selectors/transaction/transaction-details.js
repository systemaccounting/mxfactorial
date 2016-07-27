import { createSelector } from 'reselect';
import transactionTotal from './transaction-total';

export const getTransactionSelector = (state, id) => (state.transactions[id]);

const getTransactionItem = (state, id) => {
  const transaction = getTransactionSelector(state, id);
  return transaction && transaction.transaction_item;
};

export const transactionAmountSelector = createSelector([getTransactionItem], transactionTotal);
