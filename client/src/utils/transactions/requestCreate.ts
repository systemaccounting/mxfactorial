import { filterUserAddedItems, filterRuleAddedItems } from './filters';
import { getTrItemsContraAccount } from './accounts';

export function emptyItem(): App.ITransactionItem {
	return {
		id: null as unknown,
		transaction_id: null as unknown,
		item_id: null as unknown,
		price: null as unknown,
		quantity: null as unknown,
		rule_instance_id: null as unknown,
		unit_of_measurement: null as unknown,
		units_measured: null as unknown,
		debitor: null as unknown,
		creditor: null as unknown,
		debitor_profile_id: null as unknown,
		creditor_profile_id: null as unknown,
		debitor_approval_time: null as unknown,
		creditor_approval_time: null as unknown,
		debitor_expiration_time: null as unknown,
		creditor_expiration_time: null as unknown,
		debitor_rejection_time: null as unknown,
		creditor_rejection_time: null as unknown
	} as App.ITransactionItem;
}

export function addItem(items: App.ITransactionItem[]): App.ITransactionItem[] {
	const debitor = items[0].debitor;
	const creditor = items[0].creditor;
	const newItem = emptyItem();
	newItem.debitor = debitor;
	newItem.creditor = creditor;
	return [...items, newItem];
}

export function removeItem(items: App.ITransactionItem[], index: number): App.ITransactionItem[] {
	if (items.length == 1) {
		return [emptyItem()];
	}

	const userAdded = filterUserAddedItems(items);

	// rules can add request items,
	// reset if only 1 user added item left
	if (userAdded.length == 1) {
		return [emptyItem()];
	}

	items.splice(index, 1);
	return [...items];
}

export function addRuleItems(
	items: App.ITransactionItem[],
	ruleAddedItems: App.ITransactionItem[]
): App.ITransactionItem[] {
	const ruleItems = filterRuleAddedItems(ruleAddedItems);
	const userAdded = filterUserAddedItems(items);
	return [...userAdded, ...ruleItems];
}

export function changeItem<T extends keyof App.ITransactionItem>(
	items: App.ITransactionItem[],
	index: number,
	name: T,
	value: App.ITransactionItem[T]
): App.ITransactionItem[] {
	items[index][name] = value;
	return [...items];
}

export function addRecipient(
	items: App.ITransactionItem[],
	debitor: string,
	creditor: string
): App.ITransactionItem[] {
	const userAdded = filterUserAddedItems(items);
	const recipientAdded = userAdded.map((x) => {
		x.debitor = debitor;
		x.creditor = creditor;
		return x;
	});
	return [...recipientAdded];
}

export function switchRecipient(items: App.ITransactionItem[]): App.ITransactionItem[] {
	const userAdded = filterUserAddedItems(items);
	const debitor = userAdded[0].debitor;
	const creditor = userAdded[0].creditor;
	const recipientAdded = userAdded.map((x) => {
		x.debitor = creditor;
		x.creditor = debitor;
		return x;
	});
	return [...recipientAdded];
}

export function getRecipient(items: App.ITransactionItem[], currentAccount: string): string {
	const empty = [emptyItem()];
	if (JSON.stringify(items) == JSON.stringify(empty)) {
		return '';
	}
	return getTrItemsContraAccount(currentAccount, items);
}
