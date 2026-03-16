export function sortTrItems(trItems: App.ITransactionItem[]) {
	// create list of rule_exec_ids
	let ruleExecIDs: string[] = [];
	for (const trItem of trItems) {
		if (trItem.rule_exec_ids) {
			ruleExecIDs = ruleExecIDs.concat(trItem.rule_exec_ids);
		}
	}
	// dedupe list
	const unique: string[] = [...new Set(ruleExecIDs)];
	// for each unique value in rule_exec_ids
	for (const uid of unique) {
		// user added transaction item first
		trItems.sort((a) => {
			if (a.rule_exec_ids.includes(uid) && !a.rule_instance_id) {
				return 1;
			}
			if (a.rule_exec_ids.includes(uid)) {
				return -1;
			}
			return 0;
		});
		// rule added transaction item after
		trItems.sort((a) => {
			if (a.rule_exec_ids.includes(uid) && a.rule_instance_id) {
				return 1;
			}
			if (a.rule_exec_ids.includes(uid)) {
				return -1;
			}
			return 0;
		});
	}
}
