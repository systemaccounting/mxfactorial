import accountDetail, { INITIAL_STATE } from 'reducers/accountDetail';
import { SUBMIT_PROFILE_DETAILS, SUBMIT_AUTH_DETAILS } from 'actions/signUpActions';

describe('accountDetail reducer', () => {

  it('should return initial state', () => {
    accountDetail(undefined, {}).should.eql({
      account: {
        auth: {},
        profile: {}
      }
    });
  });

  it('should handle SUBMIT_PROFILE_DETAILS', () => {
    accountDetail(INITIAL_STATE, {
      type: SUBMIT_PROFILE_DETAILS,
      payload: {
        firstName: 'testing'
      }
    }).should.eql({
      account: {
        auth: {},
        profile: {
          firstName: 'testing'
        }
      }
    });
  });

  it('should handle SUBMIT_AUTH_DETAILS', () => {
    accountDetail(INITIAL_STATE, {
      type: SUBMIT_AUTH_DETAILS,
      payload: {
        userName: 'testing'
      }
    }).should.eql({
      account: {
        auth: {
          userName: 'testing'
        },
        profile: {}
      }
    });
  });

});
