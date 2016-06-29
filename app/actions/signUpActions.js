import { createAction } from 'redux-actions';
import { post } from './async';

export const SUBMIT_PROFILE_DETAILS = 'SUBMIT_PROFILE_DETAILS';
export const SUBMIT_AUTH_DETAILS= 'SUBMIT_AUTH_DETAILS';

export const submitProfileDetails = createAction(SUBMIT_PROFILE_DETAILS);
export const submitAuthDetails = createAction(SUBMIT_AUTH_DETAILS);

export const USER_PATH = '/account';
export const POST_CREATE_ACCOUNT = 'POST_CREATE_ACCOUNT';

export const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

export const postCreateAccount = post(USER_PATH, POST_CREATE_ACCOUNT, headers);
