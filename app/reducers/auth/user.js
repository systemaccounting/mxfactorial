import clone from 'lodash/clone';
import { handleActions } from 'redux-actions';

import { LOGIN } from 'actions/authActions';
import { EMAIL_CHANGED } from 'actions/accountSettingActions';
import { generateAsyncTypes } from 'actions/async';

const { success } = generateAsyncTypes(LOGIN);

export default handleActions({
  [success]: (state, action) => (action.payload.user),
  [EMAIL_CHANGED]: (state, action) => {
    const newState = clone(state);
    newState.account_profile = newState.account_profile.slice(0);
    newState.account_profile[0].email_address = action.payload;
    return newState;
  }
}, {});
