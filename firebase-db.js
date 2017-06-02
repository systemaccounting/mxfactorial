var firebase = require('firebase-admin');
var config = require('./config.js');

firebase.initializeApp({
  databaseURL: config.get('FIREBASE_URL'),
  credential: firebase.credential.cert(config.get('FIREBASE_KEY_PATH'))
});

module.exports = firebase.database();
