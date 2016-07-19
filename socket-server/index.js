var notificationHub = require('notification/hub');

module.exports = function (httpServer) {
  var io = require('socket.io')(httpServer);

  io.of('/notify').on('connection', function (socket) {
    notificationHub.subscribe(socket);

    socket.on('disconnect', function () {

    });
  });
};
