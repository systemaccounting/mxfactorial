import {
  CLEAR_ALL_NOTIFICATIONS, RECEIVED_NOTIFICATIONS, ADDED_NOTIFICATION, UPDATED_NOTIFICATION, REMOVED_NOTIFICATION
} from 'actions/notificationActions';

import notifications from 'reducers/notifications';

describe('notifications reducer', () => {
  it('should handle CLEAR_ALL_NOTIFICATIONS', () => {
    notifications(undefined, {
      type: CLEAR_ALL_NOTIFICATIONS
    }).should.eql({});
  });

  it('should handle RECEIVED_NOTIFICATIONS', () => {
    notifications(undefined, {
      type: RECEIVED_NOTIFICATIONS,
      payload: {
        0: {}
      }
    }).should.eql({
      0: {}
    });
  });

  it('should handle ADDED_NOTIFICATION', () => {
    notifications({
      0: {}
    }, {
      type: ADDED_NOTIFICATION,
      payload: {
        1: {}
      }
    }).should.eql({
      0: {},
      1: {}
    });
  });

  it('should handle UPDATED_NOTIFICATION', () => {
    notifications({
      0: {},
      1: {}
    }, {
      type: UPDATED_NOTIFICATION,
      payload: {
        0: {
          key: 0
        }
      }
    }).should.eql({
      0: {
        key: 0
      },
      1: {}
    });
  });

  it('should handle REMOVED_NOTIFICATION', () => {
    notifications({
      0: {},
      1: {}
    }, {
      type: REMOVED_NOTIFICATION,
      payload: {
        1: {}
      }
    }).should.eql({
      0: {}
    });
  });
});
