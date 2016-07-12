import { createAction } from 'redux-actions';

export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';

export const clearAll = createAction(CLEAR_ALL_NOTIFICATIONS);
