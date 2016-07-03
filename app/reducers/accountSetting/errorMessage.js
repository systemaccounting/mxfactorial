import { handleActions } from 'redux-actions';

import {
  UPDATE_ACCOUNT_SETTING_ERROR, PATCH_EMAIL, PATCH_PASSWORD, PATCH_PROFILE
} from 'actions/accountSettingActions';
import { generateAsyncTypes } from 'actions/async';

const emailError = generateAsyncTypes(PATCH_EMAIL).error;
const passwordError = generateAsyncTypes(PATCH_PASSWORD).error;
const profileError = generateAsyncTypes(PATCH_PROFILE).error;

const handleError = (state, action) => (
  action.payload && action.payload.error || action.payload.message
);

export default handleActions({
  [UPDATE_ACCOUNT_SETTING_ERROR]: (state, action) => (action.payload ? action.payload : ''),
  [emailError]: handleError,
  [passwordError]: handleError,
  [profileError]: handleError
}, '');
