import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';

const getNotifications = (state) => (state.notifications);

export default createSelector([getNotifications], (notifications) => {
  return pickBy(notifications, (notification) => (!notification.read));
});
