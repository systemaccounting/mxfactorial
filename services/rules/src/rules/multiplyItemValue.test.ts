import c from "../constants";
import multiplyItemValue from "./multiplyItemValue";
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json";
import type { ITransactionItem } from "../index.d"

describe('multiplyItemValue', () => {
	test('returns added 9% tax item', () => {
		const testRuleInstanceId = '1';
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testrulename = 'multiplyItemValue';
		const testrulecreditor = 'stateofcalifornia';
		const testruleitemname = '9% state sales tax';
		const testrulefactor = '0.09';

		const singleTestItem: ITransactionItem = { ...nullFirst[0] };

		const addedItems = multiplyItemValue(
			testRuleInstanceId,
			testrulename,
			c.CREDITOR,
			testcreditor,
			singleTestItem,
			testcreditor,
			testrulecreditor,
			testruleitemname,
			testrulefactor,
		);

		expect(addedItems.length).toBe(1)
		expect(addedItems[0].creditor).toBe(testrulecreditor)
		expect(addedItems[0].item_id).toBe(testruleitemname)
		expect(addedItems[0].price).toBe("0.270")
		expect(addedItems[0].quantity).toBe("2.000")
		expect(addedItems[0].rule_instance_id).toBe(testRuleInstanceId)
	});
	// todo: negative tests
});