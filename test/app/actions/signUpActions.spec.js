import {
  SUBMIT_PROFILE_DETAILS, SUBMIT_AUTH_DETAILS,
  submitProfileDetails, submitAuthDetails,
  USER_PATH, POST_CREATE_ACCOUNT,
  postCreateAccount
} from 'actions/signUpActions';

describe('signUpActions creator', () => {
  describe('#submitProfileDetails', () => {
    it('should return SUBMIT_PROFILE_DETAILS action', () => {
      submitProfileDetails({
        firstName: 'testing'
      }).should.eql({
        type: SUBMIT_PROFILE_DETAILS,
        payload: {
          firstName: 'testing'
        }
      });
    });
  });

  describe('#submitAuthDetails', () => {
    it('should return SUBMIT_AUTH_DETAILS action', () => {
      submitAuthDetails({
        userName: 'testing'
      }).should.eql({
        type: SUBMIT_AUTH_DETAILS,
        payload: {
          userName: 'testing'
        }
      });
    });
  });

  describe('#postCreateAccount', () => {
    it('should return POST_CREATE_ACCOUNT action', () => {
      const data = { userName: 'sandy' };
      postCreateAccount({
        userName: 'sandy'
      }).should.eql({
        type: POST_CREATE_ACCOUNT,
        payload: {
          request: {
            method: 'POST',
            url: USER_PATH,
            data
          }
        }
      });
    });
  });
});
