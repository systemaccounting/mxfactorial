export function requestTime(trItems: App.ITransactionItem[]): Date {
	let requestDate: Date = new Date();

	for (const trItem of trItems) {
		if (trItem.creditor_approval_time != null) {
			const crApprTime = new Date(trItem.creditor_approval_time);
			if (crApprTime < requestDate) {
				requestDate = crApprTime;
			}
		}
		if (trItem.debitor_approval_time != null) {
			const dbApprTime = new Date(trItem.debitor_approval_time);
			if (dbApprTime < requestDate) {
				requestDate = dbApprTime;
			}
		}
	}
	return requestDate;
}

export function expirationTime(trItems: App.ITransactionItem[]): Date {
	let expirationTime: Date = new Date();

	let nullCount = 0;
	for (const trItem of trItems) {
		if (trItem.creditor_expiration_time != null) {
			const crExpTime = new Date(trItem.creditor_expiration_time);
			if (crExpTime < expirationTime) {
				expirationTime = crExpTime;
			}
		} else {
			nullCount++;
		}
		if (trItem.debitor_expiration_time != null) {
			const dbExpTime = new Date(trItem.debitor_expiration_time);
			if (dbExpTime < expirationTime) {
				expirationTime = dbExpTime;
			}
		} else {
			nullCount++;
		}
	}
	// return 0 date for 0 expiration timestamps
	if (nullCount == trItems.length * 2) {
		return new Date(0);
	}
	return expirationTime;
}
