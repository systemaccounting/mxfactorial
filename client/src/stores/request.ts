import { writable } from 'svelte/store';
import type { ITransactionItem } from "../main.d"
import initial from "../data/initial.json"
import { filterUserAddedItems, filterRuleAddedItems } from "../utils/transactions"

let request: ITransactionItem[] = JSON.parse(JSON.stringify(initial));

const { subscribe, set, update } = writable(request);

function addRequestItem(): void {
	return update(function (reqItems: ITransactionItem[]) {
		// avoid refs
		let debitor = reqItems[0].debitor;
		let creditor = reqItems[0].creditor;
		let newReqItems: ITransactionItem[] = JSON.parse(JSON.stringify(initial));
		newReqItems[0].debitor = debitor;
		newReqItems[0].creditor = creditor;
		reqItems.push(...newReqItems)
		return [...reqItems];
	});
};

function removeRequestItem(index: number): void {
	return update(function (reqItems: ITransactionItem[]) {

		let init: ITransactionItem[] = JSON.parse(JSON.stringify(initial));

		// reset if only 1 request item
		if (reqItems.length == 1) {
			set(init);
			return init;
		}

		// filter items added by user
		let userAdded = filterUserAddedItems(reqItems)

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

function addRuleItems(ruleAddedItems: ITransactionItem[]): void {
	return update(function (reqItems: ITransactionItem[]) {

		// filter rule items from rule endpoint response
		let ruleItems = filterRuleAddedItems(ruleAddedItems)

		// filter items currently added by user in inputs
		let userAdded = filterUserAddedItems(reqItems)

		let newRuleItems = [...userAdded, ...ruleItems];

		return newRuleItems
	});
};

function changeRequestItem(
	index: number,
	name: string,
	value: string,
): void {
	return update(function (reqItems: ITransactionItem[]) {
		reqItems[index][name] = value;
		return [...reqItems];
	});
};

function addRecipient(debitor: string, creditor: string): void {
	return update(function (reqItems: ITransactionItem[]) {
		let userAdded = filterUserAddedItems(reqItems)
		let recipientAdded = userAdded.map((x) => {
			x.debitor = debitor
			x.creditor = creditor
			return x
		})
		return [...recipientAdded];
	});
};

function switchRecipient(): void {
	return update(function (reqItems: ITransactionItem[]) {
		let userAdded = filterUserAddedItems(reqItems)
		let debitor = userAdded[0].debitor
		let creditor = userAdded[0].creditor
		let recipientAdded = userAdded.map((x) => {
			x.debitor = creditor
			x.creditor = debitor
			return x
		})
		return [...recipientAdded];
	});
};

function reset(): void {
	let init: ITransactionItem[] = JSON.parse(JSON.stringify(initial));
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