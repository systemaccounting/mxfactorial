var _ = require('lodash');
var ref = require('./ref');

var notifyModel = require('./crud');

var socketMap = {};

var subscribe = function (socket) {
  var username = socket.decoded_token.username;

  var modelInstance = notifyModel(ref, username);

  if (socketMap[username]) {
    socketMap[username].push(socket);
  } else {
    console.log('hello! ', username);
    socketMap[username] = [socket];
  }

  socket.on('value', function () {
    modelInstance
      .findAll()
      .then(function (snapshot) {
        socket.emit('value', snapshot.val());
      }).catch(function (error) {
        socket.emit('value_error', error);
      });
  });

  socket.on('read_all', function (keys) {
    modelInstance.updateSelected(keys, { received_time: new Date() });
  });

  socket.on('disconnect', function () {
    unsubscribe(socket);
  });
};

var unsubscribe = function (socket) {
  var username = socket.decoded_token.username;
  var socketList = socketMap[username];

  _.remove(socketMap[username], function (oldSocket) {
    return oldSocket === socket;
  });
  if (_.isEmpty(socketList)) {
    console.log('bye!', username);
    socketMap[username] = undefined;
  }
};

var emitEvent = function (socketList, eventName, data) {
  _.each(socketList, function (socket) {
    socket.emit(eventName, data);
  });
};

var childEventHandler = function (eventName) {
  return function (snapshot, prevChildKey) {
    var notification = snapshot.val();
    var data = {};
    data[snapshot.key] = notification;

    var socketList = notification.receiver_account && socketMap[notification.receiver_account];
    if (socketList) {
      emitEvent(socketList, eventName, data);
    }
  };
};

ref.on('child_added', childEventHandler('child_added'));

ref.on('child_changed', childEventHandler('child_changed'));

ref.on('child_removed', childEventHandler('child_removed'));

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe
};
