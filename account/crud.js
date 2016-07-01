
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

var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');
var router = express.Router();

var config = require('config.js');
var firebaseClient = require('firebase-client/index');
var USER_PATH = '/accounts';

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

var getAccountByAccountName = function (accountName) {
  return firebaseClient().then(function (instance) {
    return instance.get(USER_PATH + '/' + accountName);
  });
};

router.post('/authenticate', function list(req, res, next) {
  getAccountByAccountName(req.body.username)
    .then(function (response) {
      var data = response.data;

      if (data) {
        var payload = data;
        var token = jwt.sign(payload, config.get('API_SECRET'), {
          expiresIn: config.get('TOKEN_EXPIRE_TIME')
        });
        if (String(CryptoJS.MD5(req.body.password)) == payload.password) {
          delete payload.password;
          res.status(200).json({
            user: payload,
            token: 'JWT ' + token
          });
        } else {
          res.status(400).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(400).json({ error: 'User not found' });
      }
    }).catch(function (err) {
      res.status(500).json(err);
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
 * @apiParam {String} account Account Name - Required.
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


var putAccount = function (auth) {
  return firebaseClient().then(function (instance) {
    return instance.put(USER_PATH + '/' + auth.account, auth);
  });
};

router.post('/', function (req, res) {
  var body = req.body;
  if (!body.account || !body.password) {
    res.status(400).json({ error: 'account name and password cannot be empty' });
    return;
  }
  var auth = ['account', 'password'];
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
  var profileParams = _.pick(body, profile);
  profileParams.created_time = new Date();
  authParams.password = String(CryptoJS.MD5(authParams.password));

  getAccountByAccountName(body.account)
    .then(function (response) {
      if (response.data) {
        res.status(400).json({ error: 'Account name already registered' });
      } else {
        putAccount(_.assign(authParams, { account_profile: profileParams })).then(function (response) {
          res.status(200).json({ account: response.data.account });
        }).catch(function (err) {
          res.status(500).json(err);
        });
      }
    }).catch(function (err) {
      res.status(500).json(err);
    });
});

router.use(function handleRpcError(err, req, res, next) {
  err.response = err.message;
  next(err);
});

module.exports = router;
