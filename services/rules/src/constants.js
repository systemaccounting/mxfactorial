const DEBITOR = 'debitor';
const CREDITOR = 'creditor';
const CASES = [DEBITOR, CREDITOR];

const ACCOUNT_PROFILE_SQL = `
SELECT *
FROM account_profile
WHERE account_name = $1;`

const ACCOUNT_ROLE_TRS_SQL = `
SELECT *
FROM rule_instance
WHERE rule_type = $1 AND account_role = $2 AND account_name = $3;`

const STATE_NAME_TRS_SQL = `
SELECT *
FROM rule_instance
WHERE rule_type = $1 AND account_role = $2 AND state_name = $3;`

const APPROVAL_SQL = `
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
  APPROVAL: "approval",
  APPROVALS: "approvals",
  ACCOUNT_NAME: "account_name",
  APPROVAL_TIME_SUFFIX: "approval_time",
  RELATIVE_RULES_PATH: "./rules",
  ACCOUNT_PROFILE_SQL,
  ACCOUNT_ROLE_TRS_SQL,
  STATE_NAME_TRS_SQL,
  APPROVAL_SQL,
  DEBITOR_FIRST: 'debitor_first',
  INCONSISTENT_SEQUENCE_ERROR: "inconsistent debitor_first values",
  ARG_COUNT_ERROR: "function arg count requirement violated",
  APPROVAL_COUNT_ERROR: "approvals not found",
  RULES_NOT_FOUND_ERROR: "rules not found",
  ID: "id",
  RULE_NAME: "rule_name",
  ACCOUNT_ROLE: "account_role",
  VARIABLE_VALUES: "variable_values",
};