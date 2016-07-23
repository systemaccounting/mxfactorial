import pickBy from 'lodash/pickBy';
import values from 'lodash/values';

import getNotifications from 'selectors/notification/state';

export default (state, id) => (values(pickBy(
  getNotifications(state),
  (notification, key) => (notification.key===id))
)[0]);
