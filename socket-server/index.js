var socketioJwt = require('socketio-jwt');

var config = require('../config.js');
var notificationHub = require('../notification/hub');

module.exports = function (httpServer) {
  var io = require('socket.io')(httpServer);

  var notify = io.of('/notification');

  notify
    .on('connection', socketioJwt.authorize({
      secret: config.get('API_SECRET'),
      timeout: 15000
    })).on('authenticated', function (socket) {
      notificationHub.subscribe(socket);
    });
};
