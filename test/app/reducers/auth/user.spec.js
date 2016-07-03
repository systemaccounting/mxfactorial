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
});
