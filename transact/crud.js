'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config');
var gcloud = require('gcloud');


var datastore = gcloud.datastore({
  projectId: config.get('GCLOUD_PROJECT')
});


var router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({type:'application/json', limit:'500mb'})); 

//save transaction
router.post('/', function (req, res) {
  var body = req.body;

  var transaction_item = body.transaction_item; 
  
  if(transaction_item==undefined || transaction_item.length<=0){
    res.status(400).json({ error: "Transaction items required" });
    return;  
  }

  var transaction ={
    db_author: body.db_author,
    cr_author: body.cr_author,
    rejection_time: (body.rejection_time  || null),
    expiration_time: (body.expiration_time  || null)
  }

  var transactionDebitor = {
    db_time: body.db_time,
    db_latlng: body.db_latlng
  }
  
  var transactionCreditor = {
    cr_time: body.cr_time,
    cr_latlng: body.cr_latlng
  }

  var items = [];
  for(var item in transaction_item){
    items.push({db_account:transaction_item[item].db_account,cr_account:transaction_item[item].cr_account,value:transaction_item[item].value,quantity:transaction_item[item].quantity,units_measured:transaction_item[item].units_measured,unit_of_measurement:transaction_item[item].unit_of_measurement,name:transaction_item[item].name});
  }

  var children = [];
  var parentEntity = {
    key: datastore.key(['Transaction']),
    data: transaction
  };

  datastore.insert(parentEntity, function (err, data) {
    if (!err) {
      var parentId = parentEntity.key.id;
      children.push({key: datastore.key(['Transaction',parentId,'TransactionDebitor']),data:transactionDebitor});
      children.push({key: datastore.key(['Transaction',parentId,'TransactionCreditor']),data:transactionCreditor});
      for(var item in items){
        children.push({key: datastore.key(['Transaction',parentId,'TransactionItem']),data:items[item]});  
      }
      
      datastore.save(children, function (err, data) { 
        if (!err) {
          res.status(200).json({transaction_id:parentId});
        } else {
          res.status(500).json(err);
        }
      });
    } else {
      res.status(500).json(err);
    }
  });

});

router.get('/:id', function (req, res) {

  var key = datastore.key(['Transaction', parseInt(req.params.id, 10)]);
  console.log(key,req.params);

  datastore.get(key, function (err, entity) {
    if (err) {
      res.status(500).json(err);
    } else if (!entity) {
      res.status(500).json({message:'Not found'});
    } else {
      res.status(200).json(entity);
    }
  });
});

router.get('/', function (req, res) {
  var query = datastore.createQuery('Transaction');

  datastore.runQuery(query, function(err,data){
    if(!err)
      res.status(200).json(data);
    else
      res.status(500).json(err);
  });
});

module.exports = router;
