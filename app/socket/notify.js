/* eslint no-console: 0 */
import io from 'socket.io-client';

import { SOCKET_URL } from 'constants/index';
import extractJwt from 'extract-jwt';

import {
  receivedNotifications, addNotification, updateNotification, removeNotification
} from 'actions/notificationActions';

const link = `${SOCKET_URL}notification`;
const notifyHub = io.connect(link);
let cachedToken;
let connected = false;
let authenticated = false;
let dispatch;

const dispatchAction = (action) => {
  if (dispatch) {
    dispatch(action);
  }
};

notifyHub.on('connect', () => {
  connected = true;
  if (cachedToken) {
    authenticate(cachedToken);
  }
});

notifyHub.on('authenticated', () => {
  authenticated = true;
  notifyHub.emit('value');
});

notifyHub.on('child_added', (data) => {
  dispatchAction(addNotification(data));
});

notifyHub.on('child_changed', (data) => {
  dispatchAction(updateNotification(data));
});

notifyHub.on('child_removed', (data) => {
  dispatchAction(removeNotification(data));
});

notifyHub.on('value', (notifications) => {
  dispatchAction(receivedNotifications(notifications));
});

notifyHub.on('unauthorized', (error) => {
  console.log(error);
});

notifyHub.on('disconnect', () => {
  connected = false;
  authenticated = false;
});

export const injectDispatch = (dispatchFunc) => {
  dispatch = dispatchFunc;
};

export const isConnected = () => (connected);

export const authenticate = (token) => {
  if (!authenticated) {
    cachedToken = token;
    if (!connected) {
      notifyHub.connect();
    }
    notifyHub.emit('authenticate', { token: extractJwt(token).value });
  }
};

export const clearAll = () => {
  notifyHub.emit('clear_all');
};

export default notifyHub;
