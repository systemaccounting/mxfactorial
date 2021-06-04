// ignored by jest
// used in ../transactionItems/applyItemRules.test.ts
// for dynamic import testing

import type { ITransactionItem } from "../index.d"

export default function (
	ruleInstanceId: string,
	ruleName: string,
	ruleAccountRole: string,
	ruleAccountName: string,
	transactionItem: ITransactionItem,
	DEBITOR: string,
	CREDITOR: string,
	ITEM_NAME: string,
	FACTOR: string,
): ITransactionItem[] {
	global.applyItemRuleMockFn(
		ruleInstanceId,
		ruleName,
		ruleAccountRole,
		ruleAccountName,
		transactionItem,
		DEBITOR,
		CREDITOR,
		ITEM_NAME,
		FACTOR,
	);
	return [];
};