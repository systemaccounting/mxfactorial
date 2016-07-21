import { createAction } from 'redux-actions';

import createSocketAction from './socket';

export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';
export const RECEIVED_NOTIFICATIONS = 'RECEIVED_NOTIFICATIONS';
export const ADDED_NOTIFICATION = 'ADDED_NOTIFICATION';
export const UPDATED_NOTIFICATION = 'UPDATED_NOTIFICATION';
export const REMOVED_NOTIFICATION = 'REMOVED_NOTIFICATION';

export const clearAll = createSocketAction(CLEAR_ALL_NOTIFICATIONS, 'read_all');
export const receivedNotifications = createAction(RECEIVED_NOTIFICATIONS);
export const addNotification = createAction(ADDED_NOTIFICATION);
export const updateNotification = createAction(UPDATED_NOTIFICATION);
export const removeNotification = createAction(REMOVED_NOTIFICATION);
