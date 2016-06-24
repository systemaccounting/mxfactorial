import { handleActions } from 'redux-actions';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, CLEAR_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);

const handleClear = () => ('');

export default handleActions({
  [error]: (state, action) => ('Transaction failed'),
  [CLEAR_ERROR]: handleClear,
  [CLEAR_TRANSACTION]: handleClear
}, '');
