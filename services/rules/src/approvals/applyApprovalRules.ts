import c from "../constants";
import type { IApproval, IRuleInstance, ITransactionItem } from "../index.d";

export default async function (
	approval: IApproval,
	ruleInstances: IRuleInstance[],
	transactionItem: ITransactionItem,
	approvalTime: string,
): Promise<IApproval> {
	let postRuleApproval = Object.assign({}, approval);
	for (var r of ruleInstances) {
		if (!approval.account_name) {
			throw new Error(c.ACCOUNT_NAME_MISSING_ERROR);
		}
		if (!approval.account_role) {
			throw new Error(c.ACCOUNT_ROLE_MISSING_ERROR);
		}
		const ruleInstanceId = r.id;
		const ruleName = r.rule_name;
		const ruleAccountRole = r.account_role;
		const ruleAccountName = r.account_name;
		const ruleInstancePath = c.RELATIVE_RULES_PATH + "/" + ruleName;
		const { default: approvalRuleModule } = await import(ruleInstancePath);
		const ruleVariableValues = r.variable_values;
		const ruleApplied = approvalRuleModule(
			ruleInstanceId,
			ruleName,
			ruleAccountRole,
			ruleAccountName,
			transactionItem,
			approval,
			approvalTime,
			...ruleVariableValues,
		);
		// accommodates multiple rules
		Object.assign(postRuleApproval, ruleApplied);
	};
	return postRuleApproval;
};