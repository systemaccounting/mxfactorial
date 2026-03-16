export function isCreditor(currAcct: string, trItems: App.ITransactionItem[]): boolean {
	for (let i = 0; i < trItems.length; i++) {
		if (trItems[i].creditor == currAcct) {
			return true;
		}
	}
	return false;
}

// todo: temp until transaction rejection time added on server
export function isRejected(trItems: App.ITransactionItem[]): boolean {
	for (let i = 0; i < trItems.length; i++) {
		if (trItems[i].debitor_rejection_time != null || trItems[i].creditor_rejection_time != null) {
			return true;
		}
	}
	return false;
}

export function isRequestPending(currAcct: string, request: App.ITransaction): boolean {
	for (const req of request.transaction_items) {
		if (req.creditor == currAcct && req.creditor_approval_time) {
			return true;
		}
	}
	for (const req of request.transaction_items) {
		if (req.debitor == currAcct && req.debitor_approval_time) {
			return true;
		}
	}
	return false;
}

export function getTransContraAccount(
	currentAccount: string,
	transaction: App.ITransaction
): string | null {
	for (const trItem of transaction.transaction_items) {
		if (trItem.rule_instance_id) {
			// todo: match currentAccount to debitor or creditor
			// but requires first duplicating transactions
			// where rule added currentAccount occurrence
			// greater than 1
			continue;
		}
		if (trItem.creditor == currentAccount) {
			return trItem.debitor;
		}
		if (trItem.debitor == currentAccount) {
			return trItem.creditor;
		}
	}
	console.log(`getTransContraAccount error: ${currentAccount} not found`);
	// assumes currentAccount in rule added transaction item for now
	return transaction.author;
}

export function getTrItemsContraAccount(
	currentAccount: string,
	trItems: App.ITransactionItem[]
): string {
	if (!trItems) {
		console.error(`getTrItemsContraAccount error: 0 transaction items`);
	}
	let contraAccount = '';
	for (const trItem of trItems) {
		if (!trItem.creditor) {
			console.error(`getTrItemsContraAccount error: transaction item missing creditor`);
		}
		if (!trItem.debitor) {
			console.error(`getTrItemsContraAccount error: transaction item missing debitor`);
		}
		if (trItem.rule_instance_id) {
			continue;
		}
		if (trItem.creditor == currentAccount) {
			contraAccount = trItem.debitor;
			break;
		}
		if (trItem.debitor == currentAccount) {
			contraAccount = trItem.creditor;
			break;
		}
	}
	if (contraAccount == '') {
		console.error(`getTrItemsContraAccount error: ${currentAccount} not found`);
	}
	return contraAccount;
}
