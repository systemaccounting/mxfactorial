import { createAction } from 'redux-actions';

export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const REMOVE_TRANSACTION = 'REMOVE_TRANSACTION';
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION';

export const addTransaction = createAction(ADD_TRANSACTION);
export const removeTransaction = createAction(REMOVE_TRANSACTION);
export const updateTransaction = createAction(UPDATE_TRANSACTION);
