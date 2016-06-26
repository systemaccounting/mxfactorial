
/**
 * @apiDefine AccountExistError
 *
 * @apiError AccountExist Account with the same name already exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Server error
 *     {
 *       "error": "Account name already registered"
 *     }
 */

 /**
 * @apiDefine AccountNotFoundError
 *
 * @apiError AccountNotFound The account with given name doest not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "AccountNotFound"
 *     }
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config');
var gcloud = require('gcloud');
var CryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var _ = require('lodash');

// [START config]
var datastore = gcloud.datastore({
  projectId: config.get('GCLOUD_PROJECT')
});


var accountAuthKey = datastore.key([
  'AccountAuths'
]);
var accountProfileKey = datastore.key([
  'AccountProfiles'
]);


var router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

var getAccountByAccountName = function (accountName, cb) {
  var query = datastore.createQuery('AccountAuths')
    .filter('account', '=', accountName);

  datastore.runQuery(query, cb);
};

var getAllAccounts = function (cb) {
  var query = datastore.createQuery('AccountAuths');
  datastore.runQuery(query, cb);
}


router.post('/authenticate', function list(req, res, next) {
  getAccountByAccountName(req.body.username, function (err, data) {
    if (err) {
      res.status(500).json(err);
    } else {
      if (data && data[0] && data[0].data) {
        var payload = data[0].data;
        var token = jwt.sign(payload, config.get('API_SECRET'), {
          expiresIn: config.get('TOKEN_EXPIRE_TIME')
        });
        if (String(CryptoJS.MD5(req.body.password)) == payload.password_create) {
          delete payload.password_create;
          res.status(200).json({ user: payload, token: "JWT " + token });
        }else{
          res.status(500).json({error: "Incorrect passowrd"});
        }

      } else {
        res.status(500).json({ error: "user not found" });
      }
    }
  });
});

/**
 * @api {post} /account Create a new account
 * @apiVersion 0.0.1
 * @apiName PostAccount
 * @apiGroup Account
 * @apiPermission none
 *
 * @apiDescription Create account.
 *
 * @apiParam {String} account_name Account Name - Required.
 * @apiParam {String} Password Passowrd of account - Required.
 * @apiParam {String} first_name First name of account holder.
 * @apiParam {String} middle_name Moddile name of account holder.
 * @apiParam {String} last_name Last name of account holder.
 * @apiParam {String} date_of_birth Birthdate of account holder.
 * @apiParam {String} email_address Last name of account holder.
 * @apiParam {String} street_number Street numner of address.
 * @apiParam {String} street_name Street name of address.
 * @apiParam {String} unit_number Unit number of address.
 * @apiParam {String} floor_number Floor number of address.
 * @apiParam {String} city City of account holder.
 * @apiParam {String} county Country of account holder.
 * @apiParam {String} district District of account holder.
 * @apiParam {String} state State of account holder.
 * @apiParam {String} region Region of account holder.
 * @apiParam {String} province Address province of address.
 * @apiParam {String} territory Address territory of address.
 * @apiParam {String} postal_code Address postal code of address.
 * @apiParam {String} user_home_latlng Latitude and Longitude of account holder's home.
 * @apiParam {String} telephone_country_code Country code of account holder.
 * @apiParam {String} telephone_area_code Area code of account holder.
 * @apiParam {String} telephone_number Telephone numner of account holder.
 * @apiParam {String} occupation Occupation of account holder.
 * @apiParam {String} industry Work industry of account holder.
 *
 * @apiSuccess {Object} data    The new account's object.
 *
 * @apiUse AccountExistError
 */

router.post('/', function (req, res) {
  var body = req.body;
  if (!body.account_name || !body.password) {
    res.status(400).json({ error: "account name and password cannot be empty" });
    return;
  }
  var auth = ['account_name','password'];
  var profile = ['first_name',
                  'middle_name',
                  'last_name',
                  'date_of_birth',
                  'email_address',
                  'street_number',
                  'street_name',
                  'unit_number',
                  'floor_number',
                  'city',
                  'county',
                  'district',
                  'state',
                  'region',
                  'province',
                  'territory',
                  'postal_code',
                  'country',
                  'user_home_latlng',
                  'telephone_country_code',
                  'telephone_area_code',
                  'telephone_number',
                  'occupation',
                  'industry',
                  'created_time'
                ];
  var authParams = _.pick(body, auth);
  var profileParams = _.pick(body,profile);
  profileParams.created_time = new Date();
  authParams.password = String(CryptoJS.MD5(authParams.password));

  getAccountByAccountName(body.account_name, function (err, data) {
    if (data && data.length > 0) {
      res.status(400).json({ error: "Account name already registered" });
    } else {
      var entities = [];
      entities.push({key: datastore.key(['AccountAuths',authParams.account_name]),data: authParams});
      entities.push({key: datastore.key(['AccountAuths',authParams.account_name,'AccountProfiles']),data:profileParams});

      datastore.save(entities, function (err, data) { 
        if (!err) {
          res.status(200).json(data);
        } else {
          res.status(500).json(err);
        }
      });
    }
  });
});

//auth test

router.get('/authtest', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.status(200).json(req.user);
});

router.get('/', function (req, res) {
  getAllAccounts(function (err, data) {
    res.status(200).json(data);
  });
});

router.use(function handleRpcError(err, req, res, next) {
  err.response = err.message;
  next(err);
});

module.exports = router;
