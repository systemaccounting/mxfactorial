// stores transaction request on account/home screen

import { writable } from 'svelte/store';
import initial from "../data/initial.json"
import { filterUserAddedItems, filterRuleAddedItems } from "../utils/transactions"

const request: App.ITransactionItem[] = JSON.parse(JSON.stringify(initial));

const { subscribe, set, update } = writable(request);

function addRequestItem(): void {
	return update(function (reqItems: App.ITransactionItem[]) {
		// avoid refs
		const debitor = reqItems[0].debitor;
		const creditor = reqItems[0].creditor;
		const newReqItems: App.ITransactionItem[] = JSON.parse(JSON.stringify(initial));
		newReqItems[0].debitor = debitor;
		newReqItems[0].creditor = creditor;
		reqItems.push(...newReqItems)
		return [...reqItems];
	});
};

function removeRequestItem(index: number): void {
	return update(function (reqItems: App.ITransactionItem[]) {

		const init: App.ITransactionItem[] = JSON.parse(JSON.stringify(initial));

		// reset if only 1 request item
		if (reqItems.length == 1) {
			set(init);
			return init;
		}

		// filter items added by user
		const userAdded = filterUserAddedItems(reqItems)

		// rules can add request items to store,
		// reset if only 1 user added item left
		if (userAdded.length == 1) {
			set(init);
			return init;
		}

		reqItems.splice(index, 1);
		return [...reqItems];
	});
};

function addRuleItems(ruleAddedItems: App.ITransactionItem[]): void {
	return update(function (reqItems: App.ITransactionItem[]) {

		// filter rule items from rule endpoint response
		const ruleItems = filterRuleAddedItems(ruleAddedItems)

		// filter items currently added by user in inputs
		const userAdded = filterUserAddedItems(reqItems)

		const newRuleItems = [...userAdded, ...ruleItems];

		return newRuleItems
	});
};

function changeRequestItem(
	index: number,
	name: string,
	value: string,
): void {
	return update(function (reqItems: App.ITransactionItem[]) {
		reqItems[index][name] = value;
		return [...reqItems];
	});
};

function addRecipient(debitor: string, creditor: string): void {
	return update(function (reqItems: App.ITransactionItem[]) {
		const userAdded = filterUserAddedItems(reqItems)
		const recipientAdded = userAdded.map((x) => {
			x.debitor = debitor
			x.creditor = creditor
			return x
		})
		return [...recipientAdded];
	});
};

function switchRecipient(): void {
	return update(function (reqItems: App.ITransactionItem[]) {
		const userAdded = filterUserAddedItems(reqItems)
		const debitor = userAdded[0].debitor
		const creditor = userAdded[0].creditor
		const recipientAdded = userAdded.map((x) => {
			x.debitor = creditor
			x.creditor = debitor
			return x
		})
		return [...recipientAdded];
	});
};

function reset(): void {
	const init: App.ITransactionItem[] = JSON.parse(JSON.stringify(initial));
	return set(init)
}

export default {
	subscribe,
	addRequestItem,
	removeRequestItem,
	addRuleItems,
	changeRequestItem,
	addRecipient,
	switchRecipient,
	reset
}