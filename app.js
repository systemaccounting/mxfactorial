// Ignore this module since it's the entry point for 
// a 'getting started' app supplied by the Google Cloud Platform.
// The contents of this module will be replaced with the contents of
// main.js after Datastore integration.

'use strict';

var path = require('path');
var express = require('express');
var config = require('./config');

var app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Books
app.use('/books', require('./books/crud'));
app.use('/api/users', require('./users/crud'));
app.use('/api/books', require('./books/api'));

console.log(2321342);

// Redirect root to /books
app.get('/', function (req, res) {
  res.redirect('/books');
});

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
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
  var server = app.listen(config.get('PORT'), 'localhost', function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
