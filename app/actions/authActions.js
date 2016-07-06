import { createAction } from 'redux-actions';

import { post, get } from './async';

export const AUTH_PATH = '/account/auth';

export const LOGIN = 'LOGIN';
export const GET_ACCOUNT = 'GET_ACCOUNT';

export const login = post(AUTH_PATH, LOGIN);
export const getAccount = get(AUTH_PATH, GET_ACCOUNT);

export const RECEIVED_TOKEN = 'RECEIVED_TOKEN';
export const LOGOUT = 'LOGOUT';

export const receivedToken = createAction(RECEIVED_TOKEN);
export const logout = createAction(LOGOUT);
