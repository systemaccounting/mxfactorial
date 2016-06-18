import { reduce } from 'lodash';
import { createSelector } from 'reselect';

const getTransactionItem = (state) => (state.transaction_item);

export const transactionAmountSelector = createSelector(getTransactionItem, (items) => (
  reduce(items, (memo, item) =>(memo + item.value * item.quantity), 0)
));
