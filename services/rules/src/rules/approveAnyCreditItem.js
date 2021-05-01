const {
  CURRENT_TIMESTAMP,
} = require('../constants');
const {
  stringIfNull,
  stringIfNumber,
} = require('./shared');

module.exports = (
  ruleInstanceId,
  ruleInstanceName,
  ruleInstanceRole,
  ruleInstanceAccount,
  transactionItem,
  approver,
  CREDITOR,
  APPROVER_ROLE,
  APPROVER_NAME,
  ) => {

    // test rule_instance arguments
    if (ruleInstanceAccount != approver.account_name) {
      return approver;
    };

    const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))
    const trID = stringIfNumber(stringIfNull(transactionItem.transaction_id))
    const trItemID = stringIfNumber(stringIfNull(transactionItem.id))

    let postRuleApprover = Object.assign({}, approver);
    if (
      postRuleApprover.account_role == APPROVER_ROLE
      && postRuleApprover.account_name == APPROVER_NAME
      ) {
      // בסדר
      postRuleApprover.approval_time = CURRENT_TIMESTAMP;
      postRuleApprover.rule_instance_id = ruleInstID;
      postRuleApprover.transaction_id = trID;
      postRuleApprover.transaction_item_id = trItemID;
    }
    return postRuleApprover;
  };