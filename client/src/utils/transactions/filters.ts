export function duplicatePerRole(
	currAcct: string,
	transactions: App.ITransaction[]
): App.ITransaction[] {
	const perRole: App.ITransaction[] = [];
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

export function filterUserAddedItems(reqItems: App.ITransactionItem[]): App.ITransactionItem[] {
	return reqItems.filter((x) => !x.rule_instance_id || x.rule_instance_id == '');
}

export function filterRuleAddedItems(reqItems: App.ITransactionItem[]): App.ITransactionItem[] {
	return reqItems.filter((x) => {
		return x.rule_instance_id || x.rule_instance_id?.length > 0;
	});
}
