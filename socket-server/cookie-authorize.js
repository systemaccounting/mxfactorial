var cookie = require('cookie');
var jwt = require('jsonwebtoken');

var config = require('config.js');

module.exports = function authorize(socket) {
  return new Promise(function (resolve, reject) {
    var cookies = cookie.parse(socket.request.headers.cookie);
    if (cookies.token) {
      jwt.verify(cookies.token.replace('JWT ', ''), config.get('API_SECRET'), function (err, decoded) {
        if (!err) {
          var username = decoded && decoded.username;
          if (username) {
            resolve(username);
          } else {
            reject('Invalid token');
          }
        } else {
          reject(err);
        }
      });
    } else {
      reject('No token provided');
    }
  });
};
