import applyApprovalRules from "./applyApprovalRules";
import c from "../constants";
import type { IApproval, IRuleInstance } from "../index.d"

import emptyApproval from "../initial/approval.json"
import emptyRuleInstance from "../initial/ruleInstance.json"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"

// create test rule instance
// rule_name refers to ../rules/applyApprovalRule.test.ts
const testruleinstances: IRuleInstance[] = [
	{
		...emptyRuleInstance,
		...{
			id: "0",
			rule_name: "applyApprovalRule.test.ts",
			account_role: c.DEBITOR,
			account_name: "IgorPetrov",
			variable_values: ["test1", "test2", "test3"],
		}
	}
];

afterEach(() => {
	global.applyApproverRuleMockFn.mockClear();
});

describe('applyApprovalRules', () => {
	test('throws account name missing error', async () => {

		// create test approval
		const testapproval: IApproval = {
			...emptyApproval,
			...{
				transaction_id: "2",
				account_name: null,
				account_role: c.DEBITOR,
			}
		};

		const testapprovaltime = new Date().toISOString();

		await expect(
			applyApprovalRules(
				testapproval,
				testruleinstances,
				nullFirst[0],
				testapprovaltime)
		).rejects.toThrow(c.ACCOUNT_NAME_MISSING_ERROR);
	})

	test('throws account role missing error', async () => {
		// create test approval
		const testapproval: IApproval = {
			...emptyApproval,
			...{
				transaction_id: "2",
				account_name: "IgorPetrov",
				account_role: null,
			}
		};

		const testapprovaltime = new Date().toISOString();

		await expect(
			applyApprovalRules(
				testapproval,
				testruleinstances,
				nullFirst[0],
				testapprovaltime)
		).rejects.toThrow(c.ACCOUNT_ROLE_MISSING_ERROR);
	})

	test('calls ../rules/applyApproverRule.test.ts with args 1 time', async () => {

		// create test approval
		const testapproval: IApproval = {
			...emptyApproval,
			...{
				transaction_id: "2",
				account_name: "IgorPetrov",
				account_role: c.DEBITOR,
			}
		};

		const testapprovaltime = new Date().toISOString();

		await applyApprovalRules(
			testapproval,
			testruleinstances,
			nullFirst[0],
			testapprovaltime,
		);

		await expect(global.applyApproverRuleMockFn)
			.toHaveBeenCalledWith(
				testruleinstances[0].id,
				testruleinstances[0].rule_name,
				testruleinstances[0].account_role,
				testruleinstances[0].account_name,
				nullFirst[0],
				testapproval,
				testapprovaltime,
				...testruleinstances[0].variable_values,
			);
	});
});