// ignored by jest
// used in apply item tests
// for dynamic require testing

const {
  CURRENT_TIMESTAMP,
} = require('../constants');

module.exports = function(
  ruleInstanceId,
  ruleName,
  ruleAccountRole,
  ruleAccountName,
  transactionItem,
  DEBITOR,
  CREDITOR,
  ITEM_NAME,
  FACTOR,
  ) {
    let copiedItem = Object.assign({}, transactionItem);
    delete(copiedItem.mock); // discard mock after smuggling
    transactionItem.mock(
      ruleInstanceId,
      ruleName,
      ruleAccountRole,
      ruleAccountName,
      copiedItem,
      DEBITOR,
      CREDITOR,
      ITEM_NAME,
      FACTOR,
    );
    return [];
  };