import { handleActions } from 'redux-actions';
import assign from 'lodash/assign';

import { GET_TRANSACTION_BY_ID } from 'actions/transactionActions';
import { GET_TRANSACTION } from 'actions/transactionActions';
import { generateAsyncTypes } from 'actions/async';

const { success } = generateAsyncTypes(GET_TRANSACTION_BY_ID);
const getTransactionSuccess = generateAsyncTypes(GET_TRANSACTION).success;

export default handleActions({
  [success]: (state, action) => (assign({}, state, action.payload)),
  [getTransactionSuccess]: (state, action) => (assign({}, state, action.payload))
}, {});
