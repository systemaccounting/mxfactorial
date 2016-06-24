import { getActionTypes } from 'redux-axios-middleware';

import { onSuccess, onError, getErrorMessage } from 'middlewares/configured-axios-middleware';

describe('configured-axios-middleware', function () {
  const next = (action) => (action);
  const requestUrl = '/request-url';
  const action = {
    type: 'REQUEST',
    payload: {
      request: {
        url: '/request-url'
      }
    }
  };

  describe('onSuccess', () => {
    const response = {
      data: [1, 2, 3]
    };

    it('should fire action with response as payload', () => {
      onSuccess({ action, next, response }).should.eql({
        type: getActionTypes(action)[1],
        payload: response.data
      });

    });
  });

  describe('onError', () => {
    it('should fire action with error', () => {
      const error = {
        status: 400
      };

      onError({ action, next, error }).should.eql({
        type: getActionTypes(action)[2],
        payload: new Error(getErrorMessage(requestUrl, error.status)),
        error: true
      });
    });

    it('should fire action with error object', function () {
      const message = 'Axios error message';
      const error = new Error(message);

      onError({ action, next, error }).should.eql({
        type: getActionTypes(action)[2],
        payload: error,
        error: true
      });
    });
  });
});
