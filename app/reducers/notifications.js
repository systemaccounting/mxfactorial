import assign from 'lodash/assign';
import omitBy from 'lodash/omitBy';

import { handleActions } from 'redux-actions';

import {
  CLEAR_ALL_NOTIFICATIONS, RECEIVED_NOTIFICATIONS, ADDED_NOTIFICATION, UPDATED_NOTIFICATION, REMOVED_NOTIFICATION
} from 'actions/notificationActions';

export default handleActions({
  [CLEAR_ALL_NOTIFICATIONS]: (state, action) => ({}),
  [RECEIVED_NOTIFICATIONS]: (state, action) => (assign({}, action.payload)),
  [ADDED_NOTIFICATION]: (state, action) => (assign({}, state, action.payload)),
  [UPDATED_NOTIFICATION]: (state, action) => (assign({}, state, action.payload)),
  [REMOVED_NOTIFICATION]: (state, action) => (omitBy(state, (val, key) => (action.payload[key])))
}, {});
