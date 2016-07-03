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

  it('should handle PATCH_EMAIL_FAILURE', () => {
    errorMessage(undefined, {
      type: 'PATCH_EMAIL_FAILURE',
      payload: new Error('Invalid email'),
      error: true
    }).should.equal('Invalid email');
  });

  it('should handle PATCH_PASSWORD_FAILURE', () => {
    errorMessage(undefined, {
      type: 'PATCH_PASSWORD_FAILURE',
      payload: new Error('Old password incorrect'),
      error: true
    }).should.equal('Old password incorrect');
  });

  it('should handle PATCH_PROFILE_FAILURE', () => {
    errorMessage(undefined, {
      type: 'PATCH_PROFILE_FAILURE',
      payload: new Error('Password incorrect'),
      error: true
    }).should.equal('Password incorrect');
  });
});
