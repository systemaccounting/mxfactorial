/* eslint no-console: 0 */
import { SOCKET_URL } from 'constants/index';
import io from 'socket.io-client';

const link = `${SOCKET_URL}notify`;

const notifyHub = (function () {
  let socket;

  function init() {
    socket = io(link);

    socket.on('connect', function () {
      console.log('connected', socket);
    });

    socket.on('child_added', function (data) {
      console.log(data);
    });

    socket.on('connection_refused', function (err) {
      console.log(err);
    });

    socket.on('disconnect', function () {
    });

    return socket;
  }

  return {
    getInstance: function () {

      if ( !socket ) {
        socket = init();
      }

      return socket;
    }

  };

})();

export default notifyHub;
