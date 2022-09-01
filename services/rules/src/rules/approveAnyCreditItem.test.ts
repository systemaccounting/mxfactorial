import c from "../constants"
import approveAnyCreditItem from "./approveAnyCreditItem"
import emptyApproval from "../initial/approval.json"
import type { IApproval, ITransactionItem } from "../index.d"

import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"

describe('approveAnyCreditItem', () => {
	test('returns approval with creditor timestamp', () => {
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testapprovername = 'MiriamLevy';
		const approvalId = "0";
		const approvalRuleInstanceId = "1";
		const approvalTransactionId = "3";
		const approvalTransactionItemId = "2";
		const testapprovaltime = new Date().toISOString();


		const want: IApproval = {
			...emptyApproval,
			...{
				id: approvalId,
				rule_instance_id: approvalRuleInstanceId,
				transaction_id: approvalTransactionId,
				transaction_item_id: approvalTransactionItemId,
				account_name: testapprovername,
				account_role: c.CREDITOR,
				approval_time: testapprovaltime,
			},
		}

		const singleTestItem: ITransactionItem = {
			...nullFirst[0],
			...{
				id: approvalTransactionItemId,
				transaction_id: approvalTransactionId,
			},
		};

		const testApproval: IApproval = {
			...emptyApproval,
			...{
				id: approvalId,
				account_name: testapprovername,
				account_role: c.CREDITOR,
			},
		};

		const got = approveAnyCreditItem(
			approvalRuleInstanceId,
			null, // ruleInstanceName not used
			null, // ruleInstanceRole not used
			testapprovername,
			singleTestItem,
			testApproval,
			testapprovaltime,
			testcreditor,
			c.CREDITOR,
			testapprovername,
		);
		expect(got).toEqual(want);
	});

	test('inconsistent account returns approval without creditor timestamp', () => {
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testapprovername = 'MiriamLevy';
		const testotherapprover = 'other';
		const approvalId = "0"
		const approvalRuleInstanceId = "1"
		const approvalTransactionId = "3"
		const approvalTransactionItemId = "2"

		const want: IApproval = {
			...emptyApproval,
			...{
				id: approvalId,
				rule_instance_id: approvalRuleInstanceId,
				transaction_id: approvalTransactionId,
				transaction_item_id: approvalTransactionItemId,
				account_name: testotherapprover,
				account_role: c.CREDITOR,
				approval_time: null, // CURRENT_TIMESTAMP omitted
			},
		};

		const singleTestItem: ITransactionItem = {
			...nullFirst[0],
			...{
				id: approvalTransactionItemId,
				transaction_id: approvalTransactionId,
			},
		};

		const testApproval: IApproval = { ...want };

		const testapprovaltime = new Date().toISOString();

		const got = approveAnyCreditItem(
			approvalRuleInstanceId,
			null, // ruleInstanceName not used
			null, // ruleInstanceRole not used
			testapprovername,
			singleTestItem,
			testApproval,
			testapprovaltime,
			testcreditor,
			c.CREDITOR,
			testapprovername,
		);
		expect(got).toEqual(want);
	});
});