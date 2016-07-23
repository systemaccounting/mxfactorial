import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';
import getNotifications from './state';

export default createSelector([getNotifications], (notifications) => {
  return pickBy(notifications, (notification) => (!notification.received_time));
});
