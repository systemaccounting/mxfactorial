/**
 * @author kishan
 */

import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import accountDetails from './accountDetail';
import transaction_item from './transaction_item';
import cr_account from './cr_account';
import transactionError from './transactionError';
import accountSetting from './accountSetting';
import auth from './auth';

const rootReducer = combineReducers({
  form: formReducer,
  accountDetails,
  transaction_item,
  cr_account,
  transactionError,
  accountSetting,
  auth
});

export default rootReducer;
