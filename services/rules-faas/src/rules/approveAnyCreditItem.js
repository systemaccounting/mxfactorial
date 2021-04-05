const {
  CURRENT_TIMESTAMP,
} = require('../constants');

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

    let postRuleApprover = Object.assign({}, approver);
    if (
      postRuleApprover.account_role == APPROVER_ROLE
      && postRuleApprover.account_name == APPROVER_NAME
      ) {
      // בסדר
      postRuleApprover.approval_time = CURRENT_TIMESTAMP;
      postRuleApprover.rule_instance_id = ruleInstanceId;
      postRuleApprover.transaction_id = transactionItem.transaction_id;
      postRuleApprover.transaction_item_id = transactionItem.id;
    }
    return postRuleApprover;
  };