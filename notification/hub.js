var authorize = require('socket-server/cookie-authorize');
var db = require('firebase-db');
var ref = db.ref('notification');

var socketMap = {};

var subscribe = function (socket) {
  authorize(socket).then(function (username) {
    socketMap[username] = socket;
  }).catch(function (err) {
    socket.emit('connection_refused', err);
  });
};

ref.on('child_added', function (snapshot, prevChildKey) {
  var notification = snapshot.val();
  var socket = notification.to && socketMap[notification.to];
  if (socket) {
    socket.emit('child_added', notification);
  }
});

module.exports = {
  subscribe: subscribe
};
