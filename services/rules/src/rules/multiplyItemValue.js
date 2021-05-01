const getTransactionItem = require('../model/transactionItem');
const {
  stringIfNull,
  stringIfNumber,
} = require('./shared');

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

    // standard types
    const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))

    const addedItem = getTransactionItem(
      "",
      "",
      ITEM_NAME,
      addedItemValue.toFixed(3).toString(),
      addedItemQuantity.toFixed(3).toString(),
      repeatedTransactionSequence,
      ruleInstID,
      repeatedUnitOfMeasurement,
      repeatedUnitsMeasured,
      DEBITOR,
      CREDITOR,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    );

    return [addedItem]; // rules may return added.length > 1
};