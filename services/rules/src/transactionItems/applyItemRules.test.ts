import applyItemRules from "./applyItemRules"
import c from "../constants"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"
import emptyRuleInstance from "../initial/ruleInstance.json"
import type { IRuleInstance } from "../index.d"

afterEach(() => {
	global.applyItemRuleMockFn.mockClear();
});


describe('applyItemRules', () => {
	test('calls ../rules/applyItemRule.test.ts with args 1 time', async () => {

		// create test item rule instance
		// rule_name refers to ../rules/applyItemRule.test.ts
		const testruleinstances: IRuleInstance[] = [
			{
				...emptyRuleInstance,
				...{
					id: "0",
					rule_name: "applyItemRule.test.ts",
					account_role: c.DEBITOR,
					account_name: "IgorPetrov",
					variable_values: ["test1", "test2", "test3", "test4"],
				}
			}
		];

		await applyItemRules(
			testruleinstances,
			nullFirst[0],
		);

		await expect(global.applyItemRuleMockFn)
			.toHaveBeenCalledWith(
				testruleinstances[0].id,
				testruleinstances[0].rule_name,
				testruleinstances[0].account_role,
				testruleinstances[0].account_name,
				nullFirst[0],
				...testruleinstances[0].variable_values,
			);
	});
});