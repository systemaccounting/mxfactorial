import c from "../constants";
import type { ITransactionItem } from "../index.d"

export default function (
	trItems: ITransactionItem[],
	sequence: string[],
	approvalTime: string): ITransactionItem[] {

	// loop through all transaction items
	for (const item of trItems) {

		for (const role of sequence) {

			const roleApprovals = item.approvals.filter(x => x.account_role == role);

			// todo: error 0 roleApprovals

			let approvalCount = 0;
			let uniqueApprovalTimes = new Set();

			for (const appr of roleApprovals) {
				if (appr.approval_time) {
					approvalCount++
					uniqueApprovalTimes.add(appr.approval_time);
				};
			};

			// todo: report pending approvals
			if (roleApprovals.length > 0 && // todo: remove after adding above error
				// require timestamps for all roleApprovals
				roleApprovals.length == approvalCount &&
				// require same timestamp
				uniqueApprovalTimes.size == 1) {

				if (role == c.CREDITOR) {
					item.creditor_approval_time = approvalTime;
				};

				if (role == c.DEBITOR) {
					item.debitor_approval_time = approvalTime;
				};
			};
		};
	};

	return trItems;
};