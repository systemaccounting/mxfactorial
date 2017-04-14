'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
var nconf = module.exports = require('nconf');
var path = require('path');
const fs = require('fs');

const FIREBASE_KEY_PATH = 'mxfactorial-136a67d52477.json';
const FIREBASE_KEY_OBJ = process.env.FIREBASE_KEY_OBJ;

if (FIREBASE_KEY_OBJ) {
  // Create the config file from environment variable
  let filename = path.join(__dirname, FIREBASE_KEY_PATH);
  let content = FIREBASE_KEY_OBJ.replace(/\\\\n/g, '\\n');
  fs.writeFileSync(filename, content);
}

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'DATA_BACKEND',
    'GCLOUD_PROJECT',
    'MONGO_URL',
    'MONGO_COLLECTION',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_HOST',
    'PORT',
    'FIREBASE_URL',
    'FIREBASE_KEY_PATH'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    // dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
    // configure the appropriate settings for each storage engine below.
    // If you are unsure, use datastore as it requires no additional
    // configuration.
    DATA_BACKEND: 'datastore',

    // This is the id of your project in the Google Cloud Developers Console.
    GCLOUD_PROJECT: 'mxfactorial',

    API_SECRET: 'mxfactorialapisecret',
    TOKEN_EXPIRE_TIME: '7d',

    // MongoDB connection string
    // https://docs.mongodb.org/manual/reference/connection-string/
    MONGO_URL: 'mongodb://localhost:27017',
    MONGO_COLLECTION: 'books',

    MYSQL_USER: '',
    MYSQL_PASSWORD: '',
    MYSQL_HOST: '',
    FIREBASE_URL: 'https://mxfactorial.firebaseio.com',
    FIREBASE_KEY_PATH: FIREBASE_KEY_PATH,

    // Port the HTTP server
    PORT: 8080
  });

// Check for required settings
checkConfig('GCLOUD_PROJECT');

if (nconf.get('DATA_BACKEND') === 'cloudsql') {
  checkConfig('MYSQL_USER');
  checkConfig('MYSQL_PASSWORD');
  checkConfig('MYSQL_HOST');
} else if (nconf.get('DATA_BACKEND') === 'mongodb') {
  checkConfig('MONGO_URL');
  checkConfig('MONGO_COLLECTION');
}

function checkConfig(setting) {
  if (!nconf.get(setting)) {
    throw new Error('You must set the ' + setting + ' environment variable or' +
      ' add it to config.json!');
  }
}
