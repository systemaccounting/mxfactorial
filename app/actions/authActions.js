import { post } from './async';

export const AUTH_PATH = '/account/authenticate';
export const LOGIN = 'LOGIN';

export const login = post(AUTH_PATH, LOGIN);
