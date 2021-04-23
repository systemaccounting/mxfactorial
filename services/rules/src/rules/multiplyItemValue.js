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

    // multiply price * quantity * FACTOR, e.g. tax rate
    const addedItemValue = parseFloat(transactionItem.price) * FACTOR;
    const addedItemQuantity = parseFloat(transactionItem.quantity);

    // ok to repeat after passing testDebitorFirstValues()
    const repeatedTransactionSequence = transactionItem.debitor_first;
    const repeatedUnitOfMeasurement = transactionItem.unit_of_measurement;
    const repeatedUnitsMeasured = transactionItem.units_measured;

    const addedItem = getTransactionItem(
      null,
      null,
      ITEM_NAME,
      addedItemValue.toFixed(3).toString(),
      addedItemQuantity.toFixed(3).toString(),
      repeatedTransactionSequence,
      ruleInstanceId,
      repeatedUnitOfMeasurement,
      repeatedUnitsMeasured,
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