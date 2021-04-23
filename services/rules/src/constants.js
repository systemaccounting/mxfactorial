const DEBITOR = 'debitor';
const CREDITOR = 'creditor';
const CASES = [DEBITOR, CREDITOR];
const RULE_INSTANCE_SQL = `
SELECT *
FROM rule_instance
WHERE rule_type = $1 AND account_role = $2 AND account_name = $3;`
const APPROVER_SQL = `
SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, '') as approver
FROM account_owner ao
WHERE ao.owned_account = $1 OR ao.owned_subaccount = $1;`

module.exports = {
  DEBITOR,
  CREDITOR,
  CASES,
  ACCOUNT_ROLE_ERROR_MSG: "debitor or creditor value expected, received: ",
  NO_MATCHING_ROLE_ERROR_MSG: "not a debitor or creditor: ",
  CURRENT_TIMESTAMP: "NOW()",
  TRANSACTION_ITEM: "transaction_item",
  APPROVER: "approver",
  APPROVERS: "approvers",
  ACCOUNT_NAME: "account_name",
  APPROVAL_TIME_SUFFIX: "approval_time",
  RELATIVE_RULES_PATH: "./rules",
  RULE_INSTANCE_SQL,
  APPROVER_SQL,
  DEBITOR_FIRST: 'debitor_first',
  INCONSISTENT_SEQUENCE_ERROR: "inconsistent debitor_first values",
  ARG_COUNT_ERROR: "function arg count requirement violated",
  APPROVER_COUNT_ERROR: "approvers not found",
  ID: "id",
  RULE_NAME: "rule_name",
  ACCOUNT_ROLE: "account_role",
  VARIABLE_VALUES: "variable_values",
};