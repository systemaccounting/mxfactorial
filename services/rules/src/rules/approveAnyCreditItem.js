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
  approval,
  CREDITOR,
  APPROVAL_ROLE,
  APPROVAL_NAME,
  ) => {

    // test rule_instance arguments
    if (ruleInstanceAccount != approval.account_name) {
      return approval;
    };

    const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))
    const trID = stringIfNumber(stringIfNull(transactionItem.transaction_id))
    const trItemID = stringIfNumber(stringIfNull(transactionItem.id))

    let postRuleApproval = Object.assign({}, approval);
    if (
      postRuleApproval.account_role == APPROVAL_ROLE
      && postRuleApproval.account_name == APPROVAL_NAME
      ) {
      // בסדר
      postRuleApproval.approval_time = CURRENT_TIMESTAMP;
      postRuleApproval.rule_instance_id = ruleInstID;
      postRuleApproval.transaction_id = trID;
      postRuleApproval.transaction_item_id = trItemID;
    }
    return postRuleApproval;
  };