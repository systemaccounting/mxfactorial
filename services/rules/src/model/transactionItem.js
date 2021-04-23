const { ARG_COUNT_ERROR } = require('../constants');

module.exports = function(
  id,
  transactionId,
  itemId,
  price,
  quantity,
  debitorFirst,
  ruleInstanceId,
  unitOfMeasurement,
  unitsMeasured,
  debitor,
  creditor,
  debitorProfileId,
  creditorProfileId,
  debitorApprovalTime,
  creditorApprovalTime,
  debitorExpirationTime,
  creditorExpirationTime,
  debitorRejectionTime,
  creditorRejectionTime,
) {
  const requiredArgCount = 19;
  if (arguments.length != requiredArgCount) {
    // todo: test
    throw new Error(ARG_COUNT_ERROR);
  };
  return {
    id: id,
    transaction_id: transactionId,
    item_id: itemId,
    price: price,
    quantity: quantity,
    debitor_first: debitorFirst,
    rule_instance_id: ruleInstanceId,
    unit_of_measurement: unitOfMeasurement,
    units_measured: unitsMeasured,
    debitor: debitor,
    creditor: creditor,
    debitor_profile_id: debitorProfileId,
    creditor_profile_id: creditorProfileId,
    debitor_approval_time: debitorApprovalTime,
    creditor_approval_time: creditorApprovalTime,
    debitor_expiration_time: debitorExpirationTime,
    creditor_expiration_time: creditorExpirationTime,
    debitor_rejection_time: debitorRejectionTime,
    creditor_rejection_time: creditorRejectionTime
  };
}