const {
  RELATIVE_RULES_PATH,
  ID,
  RULE_NAME,
  ACCOUNT_ROLE,
  ACCOUNT_NAME,
  VARIABLE_VALUES,
} = require('./constants');

module.exports = function(
  approver,
  ruleInstances,
  transactionItem,
  ) {
  let postRuleApprover = Object.assign({}, approver);
  for (var r of ruleInstances) {
    const ruleInstanceId = r[ID];
    const ruleName = r[RULE_NAME];
    const ruleAccountRole = r[ACCOUNT_ROLE];
    const ruleAccountName = r[ACCOUNT_NAME];
    const approverRuleModule = require(
      RELATIVE_RULES_PATH
      + "/"
      + ruleName
    );
    const ruleVariableValues = r[VARIABLE_VALUES];
    const ruleApplied = approverRuleModule(
      ruleInstanceId,
      ruleName,
      ruleAccountRole,
      ruleAccountName,
      transactionItem,
      approver,
      ...ruleVariableValues,
    );
    // accommodates multiple rules
    Object.assign(postRuleApprover, ruleApplied);
  };
  return postRuleApprover;
};