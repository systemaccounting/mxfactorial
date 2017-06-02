var _ = require('lodash');

var ref = require('./ref');
var notifyRef = require('./ref');
var blacklistRef = require('./blacklist-transaction');

ref.on('child_added', function (snapshot, prevChildKey) {
  var transaction = snapshot.val();
  var transactionKey = snapshot.key;
  blacklistRef.child(transactionKey).once('value', function (snapshot) {
    if (!snapshot.val()) {
      notifyRef.push({
        key: transactionKey,
        sender_account: transaction.created_by || null,
        receiver_account: (transaction.created_by != transaction.db_author ?
          transaction.db_author : transaction.cr_author) || null,
        payload: {
          total: _.reduce(transaction.transaction_item, function (memo, item) {
            return memo + item.quantity * item.value;
          }, 0),
          direction: transaction.created_by != transaction.db_author ? -1 : 1
        },
        sent_time: new Date().toISOString(),
        received_time: null
      });
      blacklistRef.child(transactionKey).set(true);
    }
  });
});
