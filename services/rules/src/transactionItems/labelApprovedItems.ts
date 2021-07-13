import c from "../constants";
import type { ITransactionItem } from "../index.d"

export default function (trItems: ITransactionItem[], sequence: string[]): ITransactionItem[] {
	// loop through all transaction items
	for (const item of trItems) {

		for (const role of sequence) {

			const itemApprovers = item.approvals.filter(x => x.account_role == role);

			let approved = 0;

			for (const appr of itemApprovers) {
				if (appr.approval_time == c.CURRENT_TIMESTAMP) {
					approved++;
				};
			};

			// todo: report pending approvals
			if (itemApprovers.length > 0 && itemApprovers.length == approved) {

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