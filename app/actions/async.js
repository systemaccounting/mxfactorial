import { createAction } from 'redux-actions';

import { successSuffix, errorSuffix } from 'middlewares/configured-axios-middleware';

export const get = (url, type) => (params) => createAction(type)({
  request: {
    url,
    params
  }
});

export const post = (url, type) => (data) => createAction(type)({
  request: {
    method: 'POST',
    url,
    data
  }
});

export const generateAsyncTypes = (requestType) => ({
  request: requestType,
  success: `${requestType}${successSuffix}`,
  error: `${requestType}${errorSuffix}`
});
