import { handleActions } from 'redux-actions';

import { GET_EMPTY_TRANSACTION } from 'constants/index';
import { ADD_TRANSACTION, REMOVE_TRANSACTION, UPDATE_TRANSACTION } from 'actions/transactionActions';

const cloneTransactionItem = (state) => (state.slice(0));

export default handleActions({
  [ADD_TRANSACTION]: (state, action) => {
    const transaction_item = cloneTransactionItem(state);
    transaction_item.push(GET_EMPTY_TRANSACTION());
    return transaction_item;
  },
  [REMOVE_TRANSACTION]: (state, action) => {
    const transaction_item = cloneTransactionItem(state);
    transaction_item.splice(action.payload, 1);
    return transaction_item;
  },
  [UPDATE_TRANSACTION]: (state, action) => {
    const transaction_item = cloneTransactionItem(state);
    let { key, field, value } = action.payload;
    if (field==='quantity' || field === 'value') {
      value = value && Number(value) || 0;
    }
    transaction_item[key][field] = value;
    return transaction_item;
  }
}, []);
