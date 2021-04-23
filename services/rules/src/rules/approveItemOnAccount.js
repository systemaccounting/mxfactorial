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
  DEBITOR,
  CREDITOR,
  APPROVER_ROLE,
  APPROVER_NAME,
  ) => {
    // test rule_instance arguments
    if (CREDITOR != transactionItem.creditor
      || DEBITOR != transactionItem.debitor) {
      // console.error(
      //   `error: failure to match ${DEBITOR} and ${CREDITOR} in ${ruleInstanceName} rule_instance with id ${ruleInstanceId}`
      // );
      return approver;
    };

    let postRuleApprover = Object.assign({}, approver);
    if (
      // test before approving
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