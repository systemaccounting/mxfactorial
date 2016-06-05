// Entry for mxfactorial on Google Cloud Platform

'use strict';

var path = require('path');
var express = require('express');
var config = require('./config');

var app = express();

app.disable('etag');
app.set('trust proxy', true);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/systemaccounting/users', require('./users/crud'));


// Targets index.html for Node.js Flexible Environment
// See default value for index property of express.static method:
// http://expressjs.com/en/4x/api.html#express.static
app.use('/', express.static(__dirname + '/build'));

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

app.get('/', function (req, res) {
  res.status(200).json({msg: "dfd"});
});




// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});



if (module === require.main) {
  // Start the server
  var server = app.listen(config.get('PORT'), function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
