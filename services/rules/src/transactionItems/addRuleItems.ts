import c from "../constants"
import type { IPGClient, ITransactionItem, IAccountProfile } from "../index.d"

export default async function (
	sequence: string[],
	client: IPGClient,
	transactionItems: ITransactionItem[],
	getProfilesFn: Function,
	getRulesFn: Function,
	applyRulesFn: Function,
) {

	const addedItems: ITransactionItem[] = new Array();

	// add rule generated transaction items
	for (const item of transactionItems) {

		// returns creditor in index 0, then debitor in 1
		const profiles: IAccountProfile[] = await getProfilesFn(
			client,
			item.creditor,
			item.debitor,
		);

		for (const role of sequence) {

			let itemRulesPerAccount;

			if (role == c.CREDITOR) {

				// skip adding to addedItems if creditor account profile NOT returned
				if (profiles[0] == null) {
					continue;
				}

				try {
					itemRulesPerAccount = await getRulesFn(
						client,
						role,
						// creditor in index 0
						profiles[0].state_name,
						profiles[0].account_name,
					);
				} catch (e) {
					console.log("addRuleItems creditor getRulesFn: ", e)
					return e;
				};
			};

			if (role == c.DEBITOR) {

				// skip adding to addedItems if debitor account profile NOT returned
				if (profiles[1] == null) {
					continue;
				}

				try {
					itemRulesPerAccount = await getRulesFn(
						client,
						role,
						// debitor in index 1
						profiles[1].state_name,
						profiles[1].account_name,
					);
				} catch (e) {
					console.log("addRuleItems debitor getRulesFn: ", e)
					return e;
				};
			};

			let newItems: ITransactionItem[] = new Array();

			if (itemRulesPerAccount.length > 0) {
				newItems = await applyRulesFn(
					itemRulesPerAccount,
					item,
				);
			};

			addedItems.push(...newItems);
		};
	};

	return addedItems;
};