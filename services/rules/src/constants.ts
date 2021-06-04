const DEBITOR = 'debitor';
const CREDITOR = 'creditor';
const SEQUENCE = [DEBITOR, CREDITOR];

export default Object.freeze({
	DEBITOR,
	CREDITOR,
	SEQUENCE,
	INCONSISTENT_SEQUENCE_ERROR: "inconsistent debitor_first values",
	APPROVAL_COUNT_ERROR: "approvals not found",
	CURRENT_TIMESTAMP: "NOW()",
	RELATIVE_RULES_PATH: "../rules",
	FIXED_DECIMAL_PLACES: 3,
	TRANSACTION_ITEM: "transaction_item",
	APPROVAL: "approval",
	ACCOUNT_ROLE_MISSING_ERROR: "account role missing",
	ACCOUNT_NAME_MISSING_ERROR: "account name missing",
});