import { UPDATE_CR_ACCOUNT, CLEAR_TRANSACTION } from 'actions/transactionActions';

import { handleActions } from 'redux-actions';

export default handleActions({
  [UPDATE_CR_ACCOUNT]: (state, action) => (action.payload),
  [CLEAR_TRANSACTION]: (state, action) => ('')
}, '');
