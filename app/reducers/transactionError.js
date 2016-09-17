import { handleActions } from 'redux-actions';

import { generateAsyncTypes } from 'actions/async';
import { POST_TRANSACTION, UPDATE_ERROR, CLEAR_TRANSACTION } from 'actions/transactionActions';

const { error } = generateAsyncTypes(POST_TRANSACTION);
const { success } = generateAsyncTypes(POST_TRANSACTION);

const handleClear = () => ('');

export default handleActions({
  [error]: (state, action) => {
  	console.log('handleActions error()', action); 
  	return action.payload.message ? action.payload.message : 'Transaction failed';
  },
  [success]: (state, action) => {
  	console.log('handleActions success', action); 
  	return 'All good';
  },
  [UPDATE_ERROR]: (state, action) => (action.payload ? action.payload : ''),
  [CLEAR_TRANSACTION]: handleClear
}, '');
