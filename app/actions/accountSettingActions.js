import { createAction } from 'redux-actions';
import { patch } from './async';

export const UPDATE_ACCOUNT_SETTING_ERROR = 'UPDATE_ACCOUNT_SETTING_ERROR';

export const updateAccountSettingError = createAction(UPDATE_ACCOUNT_SETTING_ERROR);

export const EMAIL_PATH = '/account/email';
export const PASSWORD_PATH = '/account/password';
export const PROFILE_PATH = '/account/profile';

export const PATCH_EMAIL = 'PATCH_EMAIL';
export const PATCH_PASSWORD = 'PATCH_PASSWORD';
export const PATCH_PROFILE = 'PATCH_PROFILE';

export const patchEmail = patch(EMAIL_PATH, PATCH_EMAIL);
export const patchPassword = patch(PASSWORD_PATH, PATCH_PASSWORD);
export const patchProfile = patch(PROFILE_PATH, PATCH_PROFILE);
