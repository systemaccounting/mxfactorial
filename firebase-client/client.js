var axios = require('axios');

var config = require('../config.js');

var instance = axios.create({
  baseURL: config.get('FIREBASE_URL')
});

instance.interceptors.request.use(function (config) {
  config.url += '/.json';
  return config;
});

module.exports = instance;
