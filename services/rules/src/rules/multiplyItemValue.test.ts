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

		const singleTestItem: ITransactionItem = JSON.parse(JSON.stringify(nullFirst[0]));

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

	test('returns rule execution ids mapping user items to rule items', () => {
		const testRuleInstanceId = '1';
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testrulename = 'multiplyItemValue';
		const testrulecreditor = 'stateofcalifornia';
		const testruleitemname = '9% state sales tax';
		const testrulefactor = '0.09';

		const testItems: ITransactionItem[] = new Array();

		for (const t of nullFirst) {
			testItems.push(JSON.parse(JSON.stringify(t)))
		}

		const addedItems: ITransactionItem[] = new Array();

		for (const trItem of testItems) {
			addedItems.push(...multiplyItemValue(
				testRuleInstanceId,
				testrulename,
				c.CREDITOR,
				testcreditor,
				trItem,
				testcreditor,
				testrulecreditor,
				testruleitemname,
				testrulefactor,
			))
		}

		// filter bread transaction item
		const breadTrItem: ITransactionItem = testItems.filter(x => x.item_id == 'bread')[0]
		// parse rule_exec_id value
		const breadRuleExecID: string = breadTrItem.rule_exec_ids[0]

		// filter milk transaction item
		const milkTrItem: ITransactionItem = testItems.filter(x => x.item_id == 'milk')[0]
		// parse rule_exec_id value
		const milkRuleExecID: string = milkTrItem.rule_exec_ids[0]

		// set counters
		let breadTaxItem = 0
		let milkTaxItem = 0

		// count bread and milk occurrence of rule_exec_id value
		for (const a of addedItems) {
			if (a.rule_exec_ids[0] == breadRuleExecID) {
				breadTaxItem++
			}
			if (a.rule_exec_ids[0] == milkRuleExecID) {
				milkTaxItem++
			}
		}

		expect(breadTaxItem).toBe(1)
		expect(milkTaxItem).toBe(1)
	});
	// todo: negative tests
});