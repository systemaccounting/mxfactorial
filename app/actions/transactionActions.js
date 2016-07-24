import { createAction } from 'redux-actions';

import { post, get } from './async';

export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const REMOVE_TRANSACTION = 'REMOVE_TRANSACTION';
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION';
export const UPDATE_CR_ACCOUNT = 'UPDATE_CR_ACCOUNT';
export const CLEAR_TRANSACTION = 'CLEAR_TRANSACTION';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export const addTransaction = (cr_account) => ((dispatch, getState) => (
  dispatch(createAction(ADD_TRANSACTION)({
    cr_account,
    db_account: getState().auth.user.account
  }))
));
export const removeTransaction = createAction(REMOVE_TRANSACTION);
export const updateTransaction = createAction(UPDATE_TRANSACTION);
export const updateCRAccount = createAction(UPDATE_CR_ACCOUNT);
export const clearTransaction = createAction(CLEAR_TRANSACTION);
export const updateError = createAction(UPDATE_ERROR);

export const TRANSACT_PATH = '/transaction';

export const POST_TRANSACTION = 'POST_TRANSACTION';
export const postTransaction = post(TRANSACT_PATH, POST_TRANSACTION);
export const GET_TRANSACTION_BY_ID = 'GET_TRANSACTION_BY_ID';
export const getTransactionById = (id) => (get(`${TRANSACT_PATH}/${id}`, GET_TRANSACTION_BY_ID)());
export const GET_TRANSACTION = 'GET_TRANSACTION';
export const getTransaction = get(TRANSACT_PATH, GET_TRANSACTION);
