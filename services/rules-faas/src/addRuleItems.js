const {
  DEBITOR,
  CREDITOR,
} = require('./constants');

module.exports = async function(
  sequence,
  db,
  transactionItems,
  getRulesFn,
  applyRulesFn,
  ) {
  const addedItems = new Array();
  for(const role of sequence) {
    // add rule generated transaction items
    for (const item of transactionItems) {

      let itemRulesPerAccount;
      try {
        itemRulesPerAccount = await getRulesFn(
          db,
          role,
          item[role],
        );
      } catch(e) {
        await db.end();
        return e.toString();
      };

      const newItems = applyRulesFn(
        itemRulesPerAccount,
        item,
      );
      addedItems.push(...newItems);
    };
  };
  return addedItems;
};