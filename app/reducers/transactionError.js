import { handleActions } from 'redux-actions';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, UPDATE_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);

const handleClear = () => ('');

export default handleActions({
  [error]: (state, action) => ('Transaction failed'),
  [UPDATE_ERROR]: (state, action) => (action.payload ? action.payload : ''),
  [CLEAR_TRANSACTION]: handleClear
}, '');
