import { handleActions } from 'redux-actions';

import { UPDATE_ACCOUNT_SETTING_ERROR } from 'actions/accountSettingActions';

export default handleActions({
  [UPDATE_ACCOUNT_SETTING_ERROR]: (state, action) => (action.payload ? action.payload : '')
}, '');
