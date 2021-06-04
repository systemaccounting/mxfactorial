const {
  DEBITOR_FIRST,
  INCONSISTENT_SEQUENCE_ERROR,
  CASES,
} = require('./constants');

module.exports = function(transactionItems) {
  let nullCount = 0;
  let trueCount = 0;
  let falseCount = 0;
  for (const a of transactionItems) {
    if (a[DEBITOR_FIRST] == null) {
      nullCount++;
    };
    if (a[DEBITOR_FIRST] == true) {
      trueCount++;
    };
    if (a[DEBITOR_FIRST] == false) {
      falseCount++;
    };
  };
  if (falseCount == transactionItems.length) {
    const noRef = [...CASES];
    return noRef.reverse();
  }
  if (
    (nullCount != transactionItems.length)
    && (trueCount != transactionItems.length)
    && (falseCount != transactionItems.length)
    ) {
    throw new Error(INCONSISTENT_SEQUENCE_ERROR);
  };
  return CASES;
};