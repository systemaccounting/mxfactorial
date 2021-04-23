const pool = require('./src/db');
const addRuleItems = require('./src/addRuleItems');
const getRulesPerItemAccount = require('./src/db/getRulesPerItemAccount');
const applyItemRules = require('./src/applyItemRules');
const applyApproverRules = require('./src/applyApproverRules');
const getItemApproverNames = require('./src/db/getItemApproverNames');
const getRulesPerApprover = require('./src/db/getRulesPerApprover');
const createApprover = require('./src/model/approver');
const createTransaction = require('./src/model/transaction');
const createIntraTransaction = require('./src/model/intraTransaction');
const addApproversAndRules = require('./src/addApproversAndRules');
const labelApprovedItems = require('./src/labelApprovedItems');
const testDebitorFirstValues = require('./src/testDebitorFirstValues');

// todo: handle errors
exports.handler = async event => {
  // console.log(event);
  if (!Object.keys(event).length) {
    console.log('warming up...');
    return null;
  }

  // todo: quality test transactionItems

  // user wants DEBITOR or CREDITOR processed first
  let transactionSequence;
  try {
    transactionSequence = testDebitorFirstValues(event);
  } catch(e) {
    // Error: inconsistent debitor_first values
    return e.toString();
  }

  // get a db
  const db = await pool.getClient();

  // get item rules from db, then create items from rules
  let addedItems;
  try {
    addedItems = await addRuleItems(
      transactionSequence,
      db,
      event,
      getRulesPerItemAccount,
      applyItemRules,
    );
  } catch(e) {
    await db.end();
    return e.toString();
  };

  // combine rule added items to items received in event
  const ruleAppliedItems = [...addedItems, ...event];

  // get approvers & rules from db, then apply to items
  let ruleAppliedApprovers;
  try {
    ruleAppliedApprovers = await addApproversAndRules(
      transactionSequence,
      db,
      ruleAppliedItems,
      getItemApproverNames,
      createApprover,
      getRulesPerApprover,
      applyApproverRules,
    );
  } catch(e) {
    await db.end();
    // Error: approvers not found
    return e.toString();
  };

  // let db go
  await db.end();

  // label rule approved transaction items
  const labeledApproved = labelApprovedItems(
    ruleAppliedItems,
    transactionSequence,
  );

  // wrap in transaction
  // todo: unit test
  let sumValue = 0;
  for (let i = 0; i < labeledApproved.length; i++) {
    const itemPrice = parseFloat(labeledApproved[i].price)
    const itemQuantity = parseFloat(labeledApproved[i].quantity)
    const itemValue = itemPrice * itemQuantity
    sumValue += itemValue
  };

  const transaction = createTransaction(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    sumValue.toFixed(3).toString(),
    labeledApproved,
  )

  // wrap in IntraTransaction declared in
  // services/gopkg/types/transaction.go
  // todo: unit test
  const intraTransaction = createIntraTransaction(
    null,
    transaction,
  )
  return intraTransaction;
}
