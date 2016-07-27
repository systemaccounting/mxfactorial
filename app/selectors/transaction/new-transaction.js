import { createSelector } from 'reselect';
import transactionTotal from './transaction-total';

const getTransactionItem = (state, props) => {
  return state.transaction_item;
};

export const transactionAmountSelector = createSelector([getTransactionItem], transactionTotal);

export const newTransactionSelector = (state) => ({
  db_author: state.auth.user.account,
  cr_author: state.cr_account,
  db_time: '',
  db_latlng: '0,0',
  cr_time: '',
  cr_latlng: '0,0',
  transaction_item: state.transaction_item
});
