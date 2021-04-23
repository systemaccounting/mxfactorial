const { ARG_COUNT_ERROR } = require('../constants');

module.exports = function(
  id,
  ruleInstanceId,
  author,
  authorDeviceId,
  authorDeviceLatlng,
  authorRole,
  equilibriumTime,
  sumValue,
  transactionItems,
) {
  const requiredArgCount = 9;
  if (arguments.length != requiredArgCount) {
    // todo: test
    throw new Error(ARG_COUNT_ERROR);
  };
  return {
    id: id,
    rule_instance_id: ruleInstanceId,
    author: author,
    author_device_id: authorDeviceId,
    author_device_latlng: authorDeviceLatlng,
    author_role: authorRole,
    equilibrium_time: equilibriumTime,
    sum_value: sumValue,
    transaction_items: transactionItems,
  };
};