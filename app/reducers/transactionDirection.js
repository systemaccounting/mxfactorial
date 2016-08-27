import { handleActions } from 'redux-actions';

import { SET_TRANSACTION_DIRECTION } from 'actions/transactionActions';

export default handleActions({
  [SET_TRANSACTION_DIRECTION]: (state, action) => (action.payload)
}, 'debit');
