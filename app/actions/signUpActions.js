import { createAction } from 'redux-actions';

export const SUBMIT_PROFILE_DETAILS = 'SUBMIT_PROFILE_DETAILS';
export const SUBMIT_AUTH_DETAILS= 'SUBMIT_AUTH_DETAILS';

export const submitProfileDetails = createAction(SUBMIT_PROFILE_DETAILS);
export const submitAuthDetails = createAction(SUBMIT_AUTH_DETAILS);
