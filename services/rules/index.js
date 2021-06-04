const pool = require('./src/db');
const addRuleItems = require('./src/addRuleItems');
const getRulesPerItemAccount = require('./src/db/getRulesPerItemAccount');
const applyItemRules = require('./src/applyItemRules');
const applyApprovalRules = require('./src/applyApprovalRules');
const getItemApproverNames = require('./src/db/getItemApproverNames');
const getRulesPerApproval = require('./src/db/getRulesPerApproval');
const createApproval = require('./src/model/approval');
const addApprovalsAndRules = require('./src/addApprovalsAndRules');
const labelApprovedItems = require('./src/labelApprovedItems');
const testDebitorFirstValues = require('./src/testDebitorFirstValues');
const createResponse = require('./src/createResponse');
const { APPROVAL_COUNT_ERROR } = require('./src/constants');

// todo: handle errors
exports.handler = async event => {
  console.log(event);
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
    const errMsg = "testDebitorFirstValues: " + e.message
    console.error(errMsg)
    return errMsg;
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
    const errMsg = "addRuleItems: " + e.message;
    console.error(errMsg);
    return errMsg;
  };

  if (addedItems.length == 0) {
    console.log("rules not found")
  }

  // combine rule added items to items received in event
  const ruleAppliedItems = [...addedItems, ...event];

  // get approvals & rules from db, then apply to items
  let ruleAppliedApprovals;
  try {
    ruleAppliedApprovals = await addApprovalsAndRules(
      transactionSequence,
      db,
      ruleAppliedItems,
      getItemApproverNames,
      createApproval,
      getRulesPerApproval,
      applyApprovalRules,
    );
  } catch(e) {
    await db.end();
    // Error: approvals not found
    const errMsg = "addApprovalsAndRules: " + e.message
    console.error(errMsg)
    // return original event if 0 item and approver rules applied
    if (addedItems.length == 0 && e.message == APPROVAL_COUNT_ERROR) {
      return createResponse(event);
    }
    return errMsg;
  };

  // let db go
  await db.end();

  // label rule approved transaction items
  const labeledApproved = labelApprovedItems(
    ruleAppliedApprovals,
    transactionSequence,
  );

  const resp = createResponse(labeledApproved);

  // temp logging
  console.log(resp);
  for (const i of resp.transaction.transaction_items) {
    console.log(i)
  }

  return resp;
}
