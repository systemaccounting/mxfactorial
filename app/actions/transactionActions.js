import { createAction } from 'redux-actions';

import { post } from './async';

export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const REMOVE_TRANSACTION = 'REMOVE_TRANSACTION';
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION';
export const UPDATE_CR_ACCOUNT = 'UPDATE_CR_ACCOUNT';
export const CLEAR_TRANSACTION = 'CLEAR_TRANSACTION';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export const addTransaction = createAction(ADD_TRANSACTION);
export const removeTransaction = createAction(REMOVE_TRANSACTION);
export const updateTransaction = createAction(UPDATE_TRANSACTION);
export const updateCRAccount = createAction(UPDATE_CR_ACCOUNT);
export const clearTransaction = createAction(CLEAR_TRANSACTION);
export const updateError = createAction(UPDATE_ERROR);

export const TRANSACT_PATH = '/transact';

export const POST_TRANSACTION = 'POST_TRANSACTION';
export const postTransaction = post(TRANSACT_PATH, POST_TRANSACTION);
