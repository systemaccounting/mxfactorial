import reduce from 'lodash/reduce';

const getTransactionItem = (state) => (state.transaction_item);

export const transactionAmountSelector = (state) => (
  reduce(getTransactionItem(state), (memo, item) =>(memo + item.value * item.quantity), 0)
);

export const transactionSelector = (state) => ({
  db_author: 'Sandy',
  cr_author: state.cr_account,
  db_time: '',
  db_latlng: '0,0',
  cr_time: '',
  cr_latlng: '0,0',
  transaction_item: state.transaction_item
});
