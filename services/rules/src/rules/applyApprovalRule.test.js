// ignored by jest
// used in apply approver tests
// for dynamic require testing

const {
  CURRENT_TIMESTAMP,
} = require('../constants');

module.exports = function(
  ruleInstanceId,
  ruleInstanceName,
  ruleInstanceRole,
  ruleInstanceAccount,
  transactionItem,
  approver,
  CREDITOR,
  APPROVAL_ROLE,
  APPROVAL_NAME,
  ) {
    let copiedItem = Object.assign({}, transactionItem);
    delete(copiedItem.mock); // discard mock after smuggling
    transactionItem.mock(
      ruleInstanceId,
      ruleInstanceName,
      ruleInstanceRole,
      ruleInstanceAccount,
      copiedItem,
      approver,
      CREDITOR,
      APPROVAL_ROLE,
      APPROVAL_NAME,
    );
    return {};
  };