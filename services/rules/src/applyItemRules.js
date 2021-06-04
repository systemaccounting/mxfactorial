const {
  RELATIVE_RULES_PATH,
  ID,
  RULE_NAME,
  ACCOUNT_ROLE,
  ACCOUNT_NAME,
  VARIABLE_VALUES,
} = require('./constants');

module.exports = function(ruleInstances, transactionItem) {
  let ruleAppliedItems = new Array();
  for (var r of ruleInstances) {
    const ruleInstanceId = r[ID];
    const ruleName = r[RULE_NAME];
    const ruleAccountRole = r[ACCOUNT_ROLE];
    const ruleAccountName = r[ACCOUNT_NAME];
    const itemRuleModule = require(
      RELATIVE_RULES_PATH
      + "/"
      + ruleName
    );
    const ruleVariableValues = r[VARIABLE_VALUES];
    ruleAppliedItems = [...itemRuleModule( // spread returned items from rules
      ruleInstanceId,
      ruleName,
      ruleAccountRole,
      ruleAccountName,
      transactionItem,
      ...ruleVariableValues,
    )];
  };
  return ruleAppliedItems;
};