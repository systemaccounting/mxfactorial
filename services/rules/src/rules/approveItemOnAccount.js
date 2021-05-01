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

    const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))
    const trID = stringIfNumber(stringIfNull(transactionItem.transaction_id))
    const trItemID = stringIfNumber(stringIfNull(transactionItem.id))

    let postRuleApprover = Object.assign({}, approver);
    if (
      // test before approving
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