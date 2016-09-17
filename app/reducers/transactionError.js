import { handleActions } from 'redux-actions';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, UPDATE_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);
const { success } = generateAsyncTypes(POST_TRANSACTION);

const handleClear = () => ('');

export default handleActions({
  [error]: (state, action) => (action.payload.message ? action.payload.message : 'Transaction failed'),
  [success]: (state, action) => (''),
  [UPDATE_ERROR]: (state, action) => (action.payload ? action.payload : ''),
  [CLEAR_TRANSACTION]: handleClear
}, '');
