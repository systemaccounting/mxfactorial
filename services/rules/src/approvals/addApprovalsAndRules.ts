import c from "../constants"
import type { IApproval, ITransactionItem, IPGClient } from "../index.d"
import emptyApproval from "../initial/approval.json"

export default async function (
	sequence: string[],
	client: IPGClient,
	transactionItems: ITransactionItem[],
	approvalTime: string,
	getNamesFn: Function,
	getRulesFn: Function,
	applyRulesFn: Function,
) {

	for (const role of sequence) {

		// add rule generated transaction items
		for (const item of transactionItems) {

			let approverNames: string[];

			if (role == c.DEBITOR) {
				approverNames = await getNamesFn(client, item.debitor);
			}

			if (role == c.CREDITOR) {
				approverNames = await getNamesFn(client, item.creditor);
			}

			for (let i = 0; i < approverNames.length; i++) {

				const approvalObj: IApproval = {
					...emptyApproval,
					account_name: approverNames[i],
					account_role: role,
				};

				const rulesPerApprover = await getRulesFn(
					client,
					role,
					approverNames[i],
				);

				const rulesAppliedApprover = await applyRulesFn(
					approvalObj,
					rulesPerApprover,
					item,
					approvalTime,
				);

				// todo: label item approval only
				item.approvals.push(rulesAppliedApprover);
			};
		};
	};

	return transactionItems;
};