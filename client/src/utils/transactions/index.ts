export {
	duplicatePerRole,
	duplicatePerRole as duplicateRequestsPerRole,
	duplicatePerRole as duplicateTransactionsPerRole,
	filterUserAddedItems,
	filterRuleAddedItems
} from './filters';
export { requestTime, expirationTime } from './time';
export {
	isCreditor,
	isRejected,
	isRequestPending,
	getTransContraAccount,
	getTrItemsContraAccount
} from './accounts';
export { sortTrItems } from './sort';

export function getTransactionById(id: string, transactions: App.ITransaction[]): App.ITransaction {
	return transactions.filter((x) => x.id == id)[0];
}

export function sum(trIts: App.ITransactionItem[]): string {
	let accumulated = 0;
	for (let i = 0; i < trIts.length; i++) {
		const price = parseFloat(trIts[i].price);
		const quantity = parseFloat(trIts[i].quantity);
		if (isNaN(price) || isNaN(quantity)) {
			continue;
		}
		if (price > 0 && quantity > 0) {
			accumulated += price * quantity;
			continue;
		}
	}
	return accumulated.toFixed(3);
}

export function disableButton(trIts: App.ITransactionItem[]): boolean {
	for (const i of trIts) {
		if (i.rule_instance_id && i.rule_instance_id.length) {
			continue;
		}
		if (
			i.item_id &&
			i.item_id.length &&
			i.price &&
			i.price.length &&
			i.quantity &&
			i.quantity.length
		) {
			const price = parseFloat(i.price);
			const quantity = parseFloat(i.quantity);
			if (isNaN(price) || isNaN(quantity)) {
				return true;
			}
			if (price > 0 && quantity > 0) {
				continue;
			}
		} else {
			return true;
		}
	}
	return false;
}

export function accountsAvailable(trItems: App.ITransactionItem[]): boolean {
	for (const trItem of trItems) {
		if (trItem.debitor && trItem.debitor.length && trItem.creditor && trItem.creditor.length) {
			continue;
		} else {
			return false;
		}
	}
	return true;
}
