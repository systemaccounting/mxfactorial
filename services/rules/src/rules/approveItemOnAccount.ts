import { stringIfNull, stringIfNumber } from "./shared"
import type { IApproval, IRuleInstance, ITransactionItem } from "../index.d"


export default function (
	ruleInstanceId: string,
	ruleInstanceName: string,
	ruleInstanceRole: string,
	ruleInstanceAccount: string,
	transactionItem: ITransactionItem,
	approval: IApproval,
	approvalTime: string,
	DEBITOR: string,
	CREDITOR: string,
	APPROVER_ROLE: string,
	APPROVER_NAME: string,
): IApproval {
	// test rule_instance arguments
	if (CREDITOR != transactionItem.creditor || DEBITOR != transactionItem.debitor) {
		return approval;
	};

	const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))
	const trID = stringIfNumber(stringIfNull(transactionItem.transaction_id))
	const trItemID = stringIfNumber(stringIfNull(transactionItem.id))

	let postRuleApproval = Object.assign({}, approval);
	if (
		// test before approving
		postRuleApproval.account_role == APPROVER_ROLE
		&& postRuleApproval.account_name == APPROVER_NAME
	) {
		// בסדר
		postRuleApproval.approval_time = approvalTime;
		postRuleApproval.rule_instance_id = ruleInstID;
		postRuleApproval.transaction_id = trID;
		postRuleApproval.transaction_item_id = trItemID;
	}
	return postRuleApproval;
};