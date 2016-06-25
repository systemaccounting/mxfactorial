import { get, post, generateAsyncTypes, defaultHeaders } from 'actions/async';
import { successSuffix, errorSuffix } from 'middlewares/configured-axios-middleware';

describe('asyncActions', () => {
  const url = 'transact';
  const type = 'request';
  describe('#get', () => {
    it('should return GET action follow axios standard', () => {
      const params = { 'order_by': 'cr_account' };
      get(url, type)(params)
        .should.eql({
          type,
          payload: {
            request: {
              url,
              params
            }
          }
        });
    });
  });

  describe('#post', () => {
    it('should return POST action follow axios standard', () => {
      const data = { 'cr_account': 'malon' };
      post(url, type)(data)
        .should.eql({
          type,
          payload: {
            request: {
              method: 'POST',
              url,
              data,
              headers: defaultHeaders
            }
          }
        });
    });
  });

  describe('#generateAsyncTypes', () => {
    it('should return axios types', () => {
      generateAsyncTypes(type).should.eql({
        request: 'request',
        success: `request_${successSuffix}`,
        error: `request_${errorSuffix}`
      });
    });
  });

});
