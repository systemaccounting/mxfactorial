import { createAction } from 'redux-actions';

import { successSuffix, errorSuffix } from 'middlewares/configured-axios-middleware';

export const get = (url, type) => (params) => createAction(type)({
  request: {
    url,
    params
  }
});

export const defaultHeaders = { 'Content-Type': 'application/json' };

export const post = (url, type, headers=defaultHeaders) => (data) => createAction(type)({
  request: {
    method: 'POST',
    url,
    data,
    headers
  }
});

export const patch = (url, type) => (data) => createAction(type)({
  request: {
    method: 'PATCH',
    url,
    data
  }
});

export const generateAsyncTypes = (requestType) => ({
  request: requestType,
  success: `${requestType}_${successSuffix}`,
  error: `${requestType}_${errorSuffix}`
});
