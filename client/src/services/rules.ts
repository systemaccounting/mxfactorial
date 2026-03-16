import type { Client } from '@urql/core';
import { sum, filterUserAddedItems, disableButton, accountsAvailable } from '../utils/transactions';
import { addRuleItems } from '../utils/transactions/requestCreate';
import RULES_QUERY from '../graphql/query/rules';

const DEBOUNCE_MS = 995;

export function createRulesService(
	client: Client,
	account: string,
	setItems: (items: App.ITransactionItem[]) => void
) {
	let previouslySubmitted = '';
	let minRequestTime = Date.now() + DEBOUNCE_MS;

	async function fetchRules(userAdded: App.ITransactionItem[], isCredit: boolean) {
		previouslySubmitted = JSON.stringify(userAdded);
		const transaction = {
			author: account,
			author_role: isCredit ? 'creditor' : 'debitor',
			sum_value: sum(userAdded),
			transaction_items: userAdded
		};
		const res = await client.query(RULES_QUERY, { transaction }).toPromise();
		if (!res.data || !res.data.rules) {
			setItems(addRuleItems(userAdded, []));
		} else {
			setItems(addRuleItems(userAdded, res.data.rules.transaction_items));
		}
	}

	function onItemsChanged(reqItems: App.ITransactionItem[], isCredit: boolean) {
		minRequestTime = Date.now() + DEBOUNCE_MS;
		if (!disableButton(reqItems) && accountsAvailable(reqItems)) {
			const userAdded = filterUserAddedItems(reqItems);
			if (previouslySubmitted != JSON.stringify(userAdded)) {
				setTimeout(() => {
					if (Date.now() > minRequestTime) {
						fetchRules(userAdded, isCredit);
					}
				}, DEBOUNCE_MS + 5);
			}
		}
	}

	return { onItemsChanged };
}
