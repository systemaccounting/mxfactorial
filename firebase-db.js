var firebase = require('firebase');
var config = require('config.js');

firebase.initializeApp({
  databaseURL: config.get('FIREBASE_URL'),
  serviceAccount: config.get('FIREBASE_KEY_PATH')
});

module.exports = firebase.database();
