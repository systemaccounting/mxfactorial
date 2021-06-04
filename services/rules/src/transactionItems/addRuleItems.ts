import c from "../constants"
import type { db, ITransactionItem } from "../index.d"

export default async function (
	sequence: string[],
	db: db,
	transactionItems: ITransactionItem[],
	getRulesFn: Function,
	applyRulesFn: Function,
) {
	const addedItems = new Array();
	for (const role of sequence) {

		// add rule generated transaction items
		for (const item of transactionItems) {

			let itemRulesPerAccount;

			if (role == c.CREDITOR) {
				try {
					itemRulesPerAccount = await getRulesFn(
						db,
						role,
						item.creditor,
					);
				} catch (e) {
					return e.toString();
				};
			};

			if (role == c.DEBITOR) {
				try {
					itemRulesPerAccount = await getRulesFn(
						db,
						role,
						item.debitor,
					);
				} catch (e) {
					return e.toString();
				};
			};


			const newItems = await applyRulesFn(
				itemRulesPerAccount,
				item,
			);

			addedItems.push(...newItems);
		};
	};

	return addedItems;
};