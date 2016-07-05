import user from 'reducers/auth/user';

describe('auth/user reducer', () => {
  it('should return initial state', () => {
    user(undefined, {}).should.eql({});
  });

  it('should handle LOGIN_SUCCESS', () => {
    user(undefined, {
      type: 'LOGIN_SUCCESS',
      payload: {
        user: {
          account: 'test_account'
        }
      }
    }).should.eql({
      account: 'test_account'
    });
  });

  it('should handle EMAIL_CHANGED', () => {
    user({
      account_profile: [{}]
    }, {
      type: 'EMAIL_CHANGED',
      payload: 'new@ema.il'
    }).should.eql({
      account_profile: [{
        email_address: 'new@ema.il'
      }]
    });
  });
});
