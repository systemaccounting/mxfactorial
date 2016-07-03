import { updateAccountSettingError, UPDATE_ACCOUNT_SETTING_ERROR } from 'actions/accountSettingActions';

describe('accountSettingActions', () => {
  it('should return correct payload', () => {
    updateAccountSettingError('Error').should.eql({
      type: UPDATE_ACCOUNT_SETTING_ERROR,
      payload: 'Error'
    });
  });
});
