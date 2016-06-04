// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config');
var gcloud = require('gcloud');
var config = require('../config');
var CryptoJS = require("crypto-js");

// [START config]
var datastore = gcloud.datastore({
  projectId: config.get('GCLOUD_PROJECT')
});

var userKey = datastore.key([
  'Users'
]);


function getModel() {
  return require('./model-' + config.get('DATA_BACKEND'));
}

var router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

var getUserByUserName = function (userName, cb) {
  var query = datastore.createQuery('Users')
    .filter('user_create', '=', userName);

  datastore.runQuery(query, cb);
};


router.get('/', function list(req, res, next) {
  getUserByUserName(req.query.username, function (err, data) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(data);
    }
  });
});

//create user
router.post('/', function (req, res) {
  var user = req.body;
  if (!user.user_create || !user.password_create) {
    res.status(400).json({ error: "username and password cannot be empty" });
    return;
  }
  getUserByUserName(user.user_create, function (err, data) {
    if (data && data.length > 0) {
      res.status(400).json({ error: "username already registered" });
    } else {
      user.password_create = CryptoJS.MD5(user.password_create);
      datastore.insert({
        key: userKey,
        data: user
      }, function (err, data) {
        if (!err) {
          res.status(200).json(data);
        } else {
          res.status(500).json(err);
        }
      });
    }
  });
});

router.use(function handleRpcError(err, req, res, next) {
  err.response = err.message;
  next(err);
});

module.exports = router;
