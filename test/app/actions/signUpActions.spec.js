import {
  SUBMIT_PROFILE_DETAILS, SUBMIT_AUTH_DETAILS,
  submitProfileDetails, submitAuthDetails
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

  describe('#submitProfileDetails', () => {
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

});
