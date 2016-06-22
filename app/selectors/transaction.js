import reduce from 'lodash/reduce';

const getTransactionItem = (state) => (state.transaction_item);

export const transactionAmountSelector = (state) => (
  reduce(getTransactionItem(state), (memo, item) =>(memo + item.value * item.quantity), 0)
);
