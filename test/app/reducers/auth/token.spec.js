import token from 'reducers/auth/token';

describe('auth/token reducer', () => {
  it('should return initial state', () => {
    token(undefined, {}).should.equal('');
  });

  it('should handle LOGIN_SUCCESS', () => {
    token(undefined, {
      type: 'LOGIN_SUCCESS',
      payload: {
        token: 'JWT whatever'
      }
    }).should.equal('JWT whatever');
  });
});
