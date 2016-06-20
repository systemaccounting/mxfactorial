import { reduce } from 'lodash';
import { createSelector } from 'reselect';

const getTransactionItem = (state) => (state.transaction_item);

export const transactionAmountSelector = (state) => (
  reduce(getTransactionItem(items), (memo, item) =>(memo + item.value * item.quantity), 0)
);
