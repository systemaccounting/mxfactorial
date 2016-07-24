import extractJwt from 'extract-jwt';

describe('extractJwt', () => {
  it('should return correct scheme and token value', () => {
    extractJwt('abc xyz').should.eql({
      scheme: 'abc',
      value: 'xyz'
    });
  });
});
