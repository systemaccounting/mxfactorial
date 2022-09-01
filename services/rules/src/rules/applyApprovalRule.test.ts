// ignored by jest
// used in ../approvals/applyApproverRules.test.ts
// for dynamic import testing

import type { ITransactionItem, IApproval } from "../index.d"

export default function (
	ruleInstanceId: string,
	ruleInstanceName: string,
	ruleInstanceRole: string,
	ruleInstanceAccount: string,
	transactionItem: ITransactionItem,
	approver: IApproval,
	approvalTime: string,
	CREDITOR: string,
	APPROVER_ROLE: string,
	APPROVER_NAME: string,
) {
	global.applyApproverRuleMockFn(
		ruleInstanceId,
		ruleInstanceName,
		ruleInstanceRole,
		ruleInstanceAccount,
		transactionItem,
		approver,
		approvalTime,
		CREDITOR,
		APPROVER_ROLE,
		APPROVER_NAME,
	);
	return {};
};