import c from "../constants"
import type { IRuleInstance, ITransactionItem } from "../index.d"

export default async function (ruleInstances: IRuleInstance[], transactionItem: ITransactionItem): Promise<ITransactionItem[]> {

	let ruleAppliedItems: ITransactionItem[] = new Array();
	for (var r of ruleInstances) {
		const ruleInstanceId = r.id;
		const ruleName = r.rule_name;
		const ruleAccountRole = r.account_role;
		const ruleAccountName = r.account_name;
		const ruleInstancePath = c.RELATIVE_RULES_PATH + "/" + ruleName;
		const { default: itemRuleModule } = await import(ruleInstancePath);
		const ruleVariableValues = r.variable_values;
		ruleAppliedItems.push(...itemRuleModule( // spread returned items from rules
			ruleInstanceId,
			ruleName,
			ruleAccountRole,
			ruleAccountName,
			transactionItem,
			...ruleVariableValues,
		));
	};
	return ruleAppliedItems;
};