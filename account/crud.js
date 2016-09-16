
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
var CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');
var router = express.Router();
var validator = require('validator');
var passport = require('passport');

var config = require('config.js');
var firebaseClient = require('firebase-client/index');
var USER_PATH = '/account';
var PROFILE_FIELDS = [
  'first_name',
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
  'industry'
];

var getAccountByAccountName = function (accountName) {
  return firebaseClient().then(function (instance) {
    return instance.get(USER_PATH + '/' + accountName);
  });
};

router.post('/auth', function (req, res, next) {
  getAccountByAccountName(req.body.username)
    .then(function (response) {
      console.log('!!!!!/account/auth response.data', response.data);
      console.log('!!!!!/account/auth req.body', req.body);
      var data = response.data;

      if (data) {
        var payload = data;
        if (String(CryptoJS.MD5(req.body.password)) == payload.password) {
          delete payload.password;

          var token = jwt.sign({ username: payload.account }, config.get('API_SECRET'), {
            expiresIn: config.get('TOKEN_EXPIRE_TIME')
          });

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

router.get('/auth', passport.authenticate('jwt', { session: false }), function (req, res) {
  getAccountByAccountName(req.user.username).then(function (response) {
    delete response.data.password;
    res.status(200).json({
      user: response.data
    });
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
  var authParams = _.pick(body, auth);
  var profileParams = _.pick(body, PROFILE_FIELDS);
  profileParams.created_time = new Date();
  authParams.password = String(CryptoJS.MD5(authParams.password));
  var account_profile = _.isEmpty(profileParams) ? null : { account_profile: [profileParams] };

  getAccountByAccountName(body.account)
    .then(function (response) {
      if (response.data) {
        res.status(400).json({ error: 'Account name already registered' });
      } else {
        putAccount(_.assign(authParams, account_profile)).then(function (response) {
          res.status(200).json({ account: response.data.account });
        }).catch(function (err) {
          res.status(500).json(err);
        });
      }
    }).catch(function (err) {
      res.status(500).json(err);
    });
});

var patchEmail = function (account, email) {
  return firebaseClient().then(function (instance) {
    return instance.patch([USER_PATH, account, 'account_profile', 0].join('/'), { email_address: email });
  });
};

router.patch('/email', passport.authenticate('jwt', { session: false }), function (req, res) {
  var body = req.body;
  if (!body.account) {
    res.status(500).json({ error: 'Account is undefined' });
    return;
  }

  if (!body.email) {
    res.status(500).json({ error: 'Email required' });
    return;
  }

  if (!validator.isEmail(body.email)) {
    res.status(500).json({ error: 'Invalid email' });
    return;
  }


  patchEmail(body.account, body.email).then(function (response) {
    res.status(200).json({ success: true });
  }).catch(function (err) {
    res.status(500).json(err);
  });
});

var patchPassword = function (account, password) {
  return firebaseClient().then(function (instance) {
    return instance.patch([USER_PATH, account].join('/'), { password: String(CryptoJS.MD5(password)) });
  });
};

router.patch('/password', passport.authenticate('jwt', { session: false }), function (req, res) {
  var body = req.body;
  if (!body.account) {
    res.status(500).json({ error: 'Account is undefined' });
    return;
  }

  if (!body.new_password || !body.old_password) {
    res.status(500).json({ error: 'Password required' });
    return;
  }

  if (body.new_password.length < 8
      || /\s/.test(body.new_password)
      || !/([A-Z]|[a-z])+[0-9]+[~@#$^*()_+=[\]{}|\\,.?:-]*/g.test(body.new_password)) {
    res.status(500).json({
      error: [
        'Password must be 8 characters,',
        'both numbers and letters,',
        'special characters permitted,',
        'spaces not permitted'].join(' ')
    });
    return;
  }

  getAccountByAccountName(body.account)
    .then(function (response) {
      if (response.data && response.data.password === String(CryptoJS.MD5(body.old_password))) {
        patchPassword(body.account, body.new_password).then(function (response) {
          res.status(200).json({ success: true });
        }).catch(function (err) {
          res.status(500).json(err);
        });
      } else {
        res.status(400).json({ error: 'Old password incorrect' });
      }
    }).catch(function (err) {
      res.status(500).json(err);
    });
});

var putProfile = function (account, profile) {
  return firebaseClient().then(function (instance) {
    return instance.put([USER_PATH, account, 'account_profile'].join('/'), profile);
  });
};

router.patch('/profile', passport.authenticate('jwt', { session: false }), function (req, res) {
  var account = req.body.account;
  var password = req.body.password;
  var profile = req.body.profile;

  if (!account) {
    res.status(500).json({ error: 'Account is undefined' });
    return;
  }

  if (!password) {
    res.status(500).json({ error: 'Password required' });
    return;
  }

  profile = _.pick(profile, PROFILE_FIELDS);
  profile.created_time = new Date();

  getAccountByAccountName(account).then(function (response) {
    if (response.data.password === String(CryptoJS.MD5(password))) {
      if (response.data.account_profile) {
        profile.email_address = response.data.account_profile[0].email_address;
        profile = [profile].concat(response.data.account_profile);
      } else {
        profile = [profile];
      }
      return putProfile(account, profile);
    } else {
      res.status(400).json({ error: 'Password incorrect' });
    }
  }).then(function (response) {
    res.status(200).json({ success: true });
  }).catch(function (err) {
    res.status(500).json(err);
  });
});

router.use(function handleRpcError(err, req, res, next) {
  err.response = err.message;
  next(err);
});

module.exports = router;
