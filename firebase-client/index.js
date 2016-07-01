var google = require('googleapis');

var config = require('config.js');
var key = require(config.get('FIREBASE_KEY_PATH'));
var instance = require('./client');

module.exports = function () {
  var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/firebase.database'
  ]);

  var promise = new Promise(function (resolve, reject) {
    jwtClient.authorize(function (error, tokens) {
      if (error) {
        reject(error);
      } else {
        instance.defaults.headers = {
          Authorization: 'Bearer ' + tokens.access_token
        };
        resolve(instance);
      }
    });
  });
  return promise;
};
