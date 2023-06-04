export function duplicateRequestsPerRole(
	currAcct: string,
	requests: ITransaction[]
): ITransaction[] {
	const perRole: ITransaction[] = [];
	for (const tr of requests) {
		for (const trItem of tr.transaction_items) {
			if (trItem.creditor == currAcct) {
				perRole.push(tr);
				break;
			}
		}
		for (const trItem of tr.transaction_items) {
			if (trItem.debitor == currAcct) {
				perRole.push(tr);
				break;
			}
		}
	}
	return perRole;
}

export function duplicateTransactionsPerRole(
	currAcct: string,
	transactions: ITransaction[]
): ITransaction[] {
	const perRole: ITransaction[] = [];
	for (const tr of transactions) {
		for (const trItem of tr.transaction_items) {
			if (trItem.creditor == currAcct) {
				perRole.push(tr);
				break;
			}
		}
		for (const trItem of tr.transaction_items) {
			if (trItem.debitor == currAcct) {
				perRole.push(tr);
				break;
			}
		}
	}
	return perRole;
}

export function isCreditor(
	currAcct: string | unknown,
	trItems: ITransactionItem[]
): boolean {
	for (let i = 0; i < trItems.length; i++) {
		if (trItems[i].creditor == currAcct) {
			return true;
		}
	}
	return false;
}

// todo: temp until transaction rejection time added on server
export function isRejected(trItems: ITransactionItem[]): boolean {
	for (let i = 0; i < trItems.length; i++) {
		if (
			trItems[i].debitor_rejection_time != null ||
			trItems[i].creditor_rejection_time != null
		) {
			return true;
		}
	}
	return false;
}

export function sum(trIts: ITransactionItem[]): string {
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

export function disableButton(trIts: ITransactionItem[]): boolean {
	for (const i of trIts) {
		if (i.rule_instance_id && i.rule_instance_id.length > 0) {
			continue;
		}
		if (
			(i.item_id && i.item_id.length > 0) &&
			(i.price && i.price.length > 0) &&
			(i.quantity && i.quantity.length > 0)
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

export function requestTime(trItems: ITransactionItem[]): Date {
	let requestDate: Date = new Date();

	for (const trItem of trItems) {
		if (trItem.creditor_approval_time != null) {
			const crApprTime = new Date(trItem.creditor_approval_time);
			if (crApprTime < requestDate) { requestDate = crApprTime }
		}
		if (trItem.debitor_approval_time != null) {
			const dbApprTime = new Date(trItem.debitor_approval_time);
			if (dbApprTime < requestDate) { requestDate = dbApprTime }
		}
	}
	return requestDate;
}

export function expirationTime(trItems: ITransactionItem[]): Date {
	let expirationTime: Date = new Date();

	let nullCount = 0;
	for (const trItem of trItems) {
		if (trItem.creditor_expiration_time != null) {
			const crExpTime = new Date(trItem.creditor_expiration_time);
			if (crExpTime < expirationTime) { expirationTime = crExpTime }
		} else {
			nullCount++
		}
		if (trItem.debitor_expiration_time != null) {
			const dbExpTime = new Date(trItem.debitor_expiration_time);
			if (dbExpTime < expirationTime) { expirationTime = dbExpTime }
		} else {
			nullCount++
		}
	}
	// return 0 date for 0 expiration timestamps
	if (nullCount == trItems.length * 2) {
		return new Date(0);
	}
	return expirationTime;
}

export function getTransactionById(id: string, transactions: ITransaction[]): ITransaction {
	return transactions.filter(x => x.id == id)[0]
}

export function filterUserAddedItems(reqItems: ITransactionItem[]): ITransactionItem[] {
	return reqItems.filter(
		(x) => !x.rule_instance_id || x.rule_instance_id == ""
	);
}

export function filterRuleAddedItems(reqItems: ITransactionItem[]): ITransactionItem[] {
	return reqItems.filter((x) => {
		return x.rule_instance_id || x.rule_instance_id?.length > 0
	})
}

export function accountValuesPresent(reqItems: ITransactionItem[]): boolean {
	const debitorsWithValue = reqItems.filter((x) => {
		return x.debitor || x.debitor?.length > 0
	});
	const creditorsWithValue = reqItems.filter((x) => {
		return x.creditor || x.creditor?.length > 0
	});
	const allItemsHaveRecipients: boolean = reqItems.length == debitorsWithValue.length && reqItems.length == creditorsWithValue.length;
	return allItemsHaveRecipients;
}

export function isRequestPending(
	currAcct: string | unknown,
	request: ITransaction,
): boolean {
	for (const req of request.transaction_items) {
		if (req.creditor == currAcct && req.creditor_approval_time) {
			return true;
		};
	};
	for (const req of request.transaction_items) {
		if (req.debitor == currAcct && req.debitor_approval_time) {
			return true;
		};
	};
	return false;
}

export function getTransContraAccount(
	currentAccount: string | unknown, // todo: stores have unknown
	transaction: ITransaction
): string | null {
	for (const trItem of transaction.transaction_items) {
		if (trItem.rule_instance_id) {
			// todo: match currentAccount to debitor or creditor
			// but requires first duplicating transactions
			// where rule added currentAccount occurrence
			// greater than 1
			continue
		}
		if (trItem.creditor == currentAccount) {
			return trItem.debitor
		}
		if (trItem.debitor == currentAccount) {
			return trItem.creditor
		}
	}
	console.log(`getTransContraAccount error: ${currentAccount} not found`)
	// assumes currentAccount in rule added transaction item for now
	return transaction.author
}

export function getTrItemsContraAccount(
	currentAccount: string | unknown, // todo: stores have unknown
	trItems: ITransactionItem[]
): string | null {
	if (!trItems) {
		return null
	}
	if (trItems.length == 1) {
		if (trItems[0].debitor == null || trItems[0].creditor == null) {
			return null
		}
	}
	for (const trItem of trItems) {
		if (trItem.rule_instance_id) {
			continue
		}
		if (trItem.creditor == currentAccount) {
			return trItem.debitor
		}
		if (trItem.debitor == currentAccount) {
			return trItem.creditor
		}
	}
	console.error(`getTrItemsContraAccount error: ${currentAccount} not found`)
	return null
}