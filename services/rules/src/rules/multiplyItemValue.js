const getTransactionItem = require('../model/transactionItem');
const {
  stringIfNull,
  stringIfNumber,
  numberToFixedString
} = require('./shared');
const { ANY } = require("./keywords");


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

    // create vars for values affected by keywords
    const trsDebitor = DEBITOR == ANY ? transactionItem.debitor : DEBITOR
    const trsCreditor = CREDITOR == ANY ? transactionItem.creditor : CREDITOR

    const addedItem = getTransactionItem(
      null,
      null,
      ITEM_NAME,
      numberToFixedString(addedItemValue),
      numberToFixedString(addedItemQuantity),
      repeatedTransactionSequence,
      ruleInstID,
      repeatedUnitOfMeasurement,
      repeatedUnitsMeasured,
      trsDebitor,
      trsCreditor,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    if (transactionItem.ruleInstanceId && transactionItem.ruleInstanceId == ruleInstanceId) {
      return []; // avoid dupe
    }

    return [addedItem]; // rules may return added.length > 1
};