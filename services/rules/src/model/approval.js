const { ARG_COUNT_ERROR } = require('../constants');

module.exports = function(
  id,
  ruleInstanceId,
  transactionId,
  transactionItemId,
  accountName,
  accountRole,
  deviceId,
  deviceLatLng,
  approvalTime,
  rejectionTime,
  expirationTime
) {
  const requiredArgCount = 11;
  if (arguments.length != requiredArgCount) {
    // todo: test
    throw new Error(ARG_COUNT_ERROR);
  };
  return {
    id: id,
    rule_instance_id: ruleInstanceId,
    transaction_id: transactionId,
    transaction_item_id: transactionItemId,
    account_name: accountName,
    account_role: accountRole,
    device_id: deviceId,
    device_latlng: deviceLatLng,
    approval_time: approvalTime,
    rejection_time: rejectionTime,
    expiration_time: expirationTime,
  };
};