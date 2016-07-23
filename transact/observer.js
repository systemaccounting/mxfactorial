var _ = require('lodash');

var ref = require('./ref');
var notifyRef = require('notification/ref');
var blacklistRef = require('./blacklist-transaction');

ref.on('child_added', function (snapshot, prevChildKey) {
  var transaction = snapshot.val();
  var transactionKey = snapshot.key;
  blacklistRef.child(transactionKey).once('value', function (snapshot) {
    if (!snapshot.val()) {
      notifyRef.push({
        key: transactionKey,
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
      blacklistRef.child(transactionKey).set(true);
    }
  });
});
