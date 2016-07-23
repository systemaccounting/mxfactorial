var _ = require('lodash');

var ref = require('./ref');
var notifyRef = require('notification/ref');

ref.on('child_added', function (snapshot, prevChildKey) {
  var transaction = snapshot.val();

  notifyRef.push({
    key: snapshot.key,
    sender_account: transaction.db_author || null,
    receiver_account: transaction.cr_author || null,
    type: 'bid200',
    method: 'webclient',
    payload: _.reduce(transaction.transaction_item, function (memo, item) {
      return memo + item.quantity * item.value;
    }, 0),
    sent_time: new Date().toISOString(),
    received_time: null
  });
});
