const getTransactionItem = require('../model/transactionItem');

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

    // console.log(ruleInstanceId)

    // multiply price * quantity * FACTOR, e.g. tax rate
    const addedItemValue = transactionItem.price * transactionItem.quantity * FACTOR;
    const addedItemQuantity = 1;

    const addedItem = getTransactionItem(
      null,
      null,
      ITEM_NAME,
      addedItemValue,
      addedItemQuantity,
      null,
      ruleInstanceId,
      "",
      "",
      DEBITOR,
      CREDITOR,
      0,
      0,
      "",
      "",
      "",
      "",
      "",
      "",
    );

    return [addedItem]; // rules may return added.length > 1
};