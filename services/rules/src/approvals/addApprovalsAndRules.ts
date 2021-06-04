import c from "../constants"
import type { IApproval, ITransactionItem, db } from "../index.d"
import emptyApproval from "../initial/approval.json"

export default async function (
	sequence: string[],
	db: db,
	transactionItems: ITransactionItem[],
	getNamesFn: Function,
	getRulesFn: Function,
	applyRulesFn: Function,
) {

	for (const role of sequence) {

		// add rule generated transaction items
		for (const item of transactionItems) {

			let approverNames: string[];

			if (role == c.DEBITOR) {
				approverNames = await getNamesFn(db, item.debitor);
			}

			if (role == c.CREDITOR) {
				approverNames = await getNamesFn(db, item.creditor);
			}

			for (let i = 0; i < approverNames.length; i++) {

				const approvalObj: IApproval = {
					...emptyApproval,
					account_name: approverNames[i],
					account_role: role,
				};

				const rulesPerApprover = await getRulesFn(
					db,
					role,
					approverNames[i],
				);

				const rulesAppliedApprover = await applyRulesFn(
					approvalObj,
					rulesPerApprover,
					item,
				);

				// todo: label item approval only
				item.approvals.push(rulesAppliedApprover);
			};
		};
	};

	return transactionItems;
};