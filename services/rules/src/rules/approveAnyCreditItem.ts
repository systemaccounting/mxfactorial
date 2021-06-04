import c from "../constants"
import {
	stringIfNull,
	stringIfNumber
} from "./shared"
import type { IApproval, ITransactionItem } from "../index.d"

export default function (
	ruleInstanceId: string,
	ruleInstanceName: string,
	ruleInstanceRole: string,
	ruleInstanceAccount: string,
	transactionItem: ITransactionItem,
	approval: IApproval,
	CREDITOR: string,
	APPROVER_ROLE: string,
	APPROVER_NAME: string,
): IApproval {

	// test rule_instance arguments
	if (ruleInstanceAccount != approval.account_name) {
		return approval;
	};

	const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))
	const trID = stringIfNumber(stringIfNull(transactionItem.transaction_id))
	const trItemID = stringIfNumber(stringIfNull(transactionItem.id))

	let postRuleApproval = Object.assign({}, approval);
	if (
		postRuleApproval.account_role == APPROVER_ROLE
		&& postRuleApproval.account_name == APPROVER_NAME
	) {
		// בסדר
		postRuleApproval.approval_time = c.CURRENT_TIMESTAMP;
		postRuleApproval.rule_instance_id = ruleInstID;
		postRuleApproval.transaction_id = trID;
		postRuleApproval.transaction_item_id = trItemID;
	}
	return postRuleApproval;
};