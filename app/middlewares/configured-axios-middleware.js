import { createAction } from 'redux-actions';
import axiosMiddleware, { getActionTypes } from 'redux-axios-middleware';

import axiosClient from 'axios-client-instance.js';

export const successSuffix = 'SUCCESS';
export const errorSuffix = 'FAILURE';

export const getErrorMessage = (url, status) => (`Request to ${url} failed with status code ${status}.`);

export const onSuccess = ({ action, next, response }, options) => {
  const nextAction = createAction(getActionTypes(action, options)[1])(response.data);
  next(nextAction);
  return nextAction;
};

export const onError = ({ action, next, error }, options) => {
  let errorObject;
  if (error instanceof Error) {
    errorObject = error;
  } else {
    errorObject = new Error(getErrorMessage(action.payload.request.url, error.status));
  }

  const nextAction = createAction(getActionTypes(action, options)[2])(errorObject);
  next(nextAction);
  return nextAction;
};

export default axiosMiddleware(axiosClient, {
  onSuccess,
  onError,
  successSuffix: 'SUCCESS',
  errorSuffix: 'FAILURE'
});
