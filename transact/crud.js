'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var _ = require('lodash');
var passport = require('passport');

var firebaseClient = require('firebase-client/index');
var TRANSACTION_PATH = '/transaction';

var router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ type: 'application/json', limit: '500mb' }));

var postTransaction = function (data) {
  return firebaseClient().then(function (instance) {
    return instance.post(TRANSACTION_PATH, data);
  });
};

//save transaction
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  var body = req.body;
  var transaction_item = body.transaction_item;

  if (_.isEmpty(transaction_item)) {
    res.status(400).json({ error: 'Transaction items required' });
    return;
  }

  var transaction = {
    db_author: body.db_author,
    cr_author: body.cr_author,
    rejection_time: (body.rejection_time || null),
    expiration_time: moment().add(body.expiration_time||0, 'd').format(),
    db_time: moment().format('HH:mm'),
    db_latlng: body.db_latlng,
    cr_time: moment().format('HH:mm'),
    cr_latlng: body.cr_latlng,
    created_by: req.user.username
  };

  transaction_item = _.map(transaction_item, function (item) {
    return {
      db_account: item.db_account,
      cr_account: item.cr_account,
      value: item.value,
      quantity: item.quantity,
      units_measured: item.units_measured,
      unit_of_measurement: item.unit_of_measurement,
      name: item.name
    };
  });

  postTransaction(_.assign({}, transaction, {
    transaction_item: transaction_item
  })).then(function (response) {
    res.status(200).json({ transaction_id: response.data.name });
  }).catch(function (err) {
    res.status(500).json(err);
  });
});

var getTransaction = function (id) {
  return firebaseClient().then(function (instance) {
    return instance.get(TRANSACTION_PATH + '/' + id);
  });
};

router.get('/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
  getTransaction(req.params.id).then(function (response) {
    if (response.data) {
      var result = {};
      result[req.params.id] = response.data;
      res.status(200).json(result);
    } else {
      res.status(500).json({ error: 'Not found' });
    }
  }).catch(function (err) {
    res.status(500).json(err);
  });
});

var getAllTransaction = function (account) {
  return firebaseClient().then(function (instance) {
    return instance.get(TRANSACTION_PATH, { orderBy: 'cr_author', equalTo: account });
  });
};

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  getAllTransaction(req.user.username).then(function (response) {
    res.status(200).json(response.data);
  }).catch(function (err) {
    res.status(500).json(err);
  });
});

module.exports = router;
