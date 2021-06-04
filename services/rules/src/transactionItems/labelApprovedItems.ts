import c from "../constants";
import type { ITransactionItem } from "../index.d"

export default function (trItems: ITransactionItem[], sequence: string[]): ITransactionItem[] {
	// loop through all transaction items
	for (const item of trItems) {

		// repeated from getItemApproverNames.js in case of reuse
		if (!item.approvals.length) {
			throw new Error(c.APPROVAL_COUNT_ERROR);
		};
		for (const role of sequence) {

			let notApproved = 0;
			const itemApprovers = item.approvals.filter(x => x.account_role == role);

			if (!itemApprovers.length) {
				throw new Error(c.ACCOUNT_ROLE_MISSING_ERROR);
			};

			for (const appr of itemApprovers) {

				// let the loop lapse to test all approvals applied
				if (appr.approval_time == c.CURRENT_TIMESTAMP) {
					continue;
				} else {
					notApproved++;
					break;
				};
			};

			// todo: report pending approvals
			if (notApproved == 0) {

				if (role == c.CREDITOR) {
					item.creditor_approval_time = c.CURRENT_TIMESTAMP;
				};

				if (role == c.DEBITOR) {
					item.debitor_approval_time = c.CURRENT_TIMESTAMP;
				};
			};
		};
	};

	return trItems;
};