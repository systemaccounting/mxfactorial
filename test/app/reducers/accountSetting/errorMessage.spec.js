import errorMessage from 'reducers/accountSetting/errorMessage';

import { UPDATE_ACCOUNT_SETTING_ERROR } from 'actions/accountSettingActions';

describe('accountSetting/errorMessage reducer', () => {
  it('should return empty string on initial state', () => {
    errorMessage(undefined, {}).should.equal('');
  });

  it('should handle UPDATE_ACCOUNT_SETTING_ERROR', () => {
    errorMessage(undefined, {
      type: UPDATE_ACCOUNT_SETTING_ERROR,
      payload: 'Password missmatch'
    }).should.equal('Password missmatch');
  });
});
