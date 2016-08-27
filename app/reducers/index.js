/**
 * @author kishan
 */

import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import cookie from 'react-cookie';

import accountDetails from './accountDetail';
import transaction_item from './transaction_item';
import cr_account from './cr_account';
import transactionError from './transactionError';
import accountSetting from './accountSetting';
import auth from './auth';
import notifications from './notifications';
import transactions from './transactions';
import requestsFilter from './requestsFilter';
import { LOGOUT } from 'actions/authActions';
import transactionDirection from './transactionDirection';

const appReducer = combineReducers({
  form: formReducer,
  accountDetails,
  transaction_item,
  cr_account,
  transactionError,
  accountSetting,
  auth,
  notifications,
  transactions,
  requestsFilter,
  transactionDirection
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    cookie.remove('token');
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
