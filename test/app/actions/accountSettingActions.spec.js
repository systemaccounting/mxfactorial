import {
  updateAccountSettingError, UPDATE_ACCOUNT_SETTING_ERROR,
  patchEmail, EMAIL_PATH, PATCH_EMAIL,
  patchPassword, PASSWORD_PATH, PATCH_PASSWORD,
  patchProfile, PROFILE_PATH, PATCH_PROFILE
} from 'actions/accountSettingActions';

describe('accountSettingActions', () => {
  describe('#updateAccountSettingError', () => {
    it('should return correct payload', () => {
      updateAccountSettingError('Error').should.eql({
        type: UPDATE_ACCOUNT_SETTING_ERROR,
        payload: 'Error'
      });
    });
  });

  describe('#patchEmail', () => {
    it('should return correct payload', () => {
      patchEmail({ email: 'lorem@ipsum.co' }).should.eql({
        type: PATCH_EMAIL,
        payload: {
          request: {
            url: EMAIL_PATH,
            method: 'PATCH',
            data: {
              email: 'lorem@ipsum.co'
            }
          }
        }
      });
    });
  });

  describe('#patchPassword', () => {
    it('should return correct payload', () => {
      patchPassword({ old_password: 'qWk2vl9o' }).should.eql({
        type: PATCH_PASSWORD,
        payload: {
          request: {
            url: PASSWORD_PATH,
            method: 'PATCH',
            data: {
              old_password: 'qWk2vl9o'
            }
          }
        }
      });
    });
  });

  describe('#patchProfile', () => {
    it('should return correct payload', () => {
      patchProfile({ country: 'Viet Nam' }).should.eql({
        type: PATCH_PROFILE,
        payload: {
          request: {
            url: PROFILE_PATH,
            method: 'PATCH',
            data: {
              country: 'Viet Nam'
            }
          }
        }
      });
    });
  });
});
