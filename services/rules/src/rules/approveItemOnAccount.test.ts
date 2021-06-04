import c from "../constants"
import approveItemOnAccount from "./approveItemOnAccount"
import emptyApproval from "../initial/approval.json"
import type { IApproval, ITransactionItem } from "../index.d"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"

describe('approveItemOnAccount', () => {
	test('returns approval with creditor timestamp', () => {

		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testapprovername = 'MiriamLevy';
		const approvalId = "0";
		const approvalRuleInstanceId = "1";
		const approvalTransactionId = "3";
		const approvalTransactionItemId = "2";

		const want: IApproval = {
			...emptyApproval,
			...{
				id: approvalId,
				rule_instance_id: approvalRuleInstanceId,
				transaction_id: approvalTransactionId,
				transaction_item_id: approvalTransactionItemId,
				account_name: testapprovername,
				account_role: c.CREDITOR,
				approval_time: c.CURRENT_TIMESTAMP
			},
		};

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

		const got = approveItemOnAccount(
			approvalRuleInstanceId,
			null, // ruleInstanceName not used
			null, // ruleInstanceRole not used
			testapprovername,
			singleTestItem,
			testApproval,
			testdebitor,
			testcreditor,
			c.CREDITOR,
			testapprovername,
		);
		expect(got).toEqual(want);
	});

	test('inconsistent accounts returns approver without timestamp', () => {

		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';
		const testapprovername = 'MiriamLevy';
		const approvalId = "0";
		const approvalRuleInstanceId = "1";
		const approvalTransactionId = "3";
		const approvalTransactionItemId = "2";


		const want: IApproval = {
			...emptyApproval,
			...{
				id: approvalId,
				rule_instance_id: approvalRuleInstanceId,
				transaction_id: approvalTransactionId,
				transaction_item_id: approvalTransactionItemId,
				account_name: testapprovername,
				account_role: c.CREDITOR,
				approval_time: null,
			},
		};

		const singleTestItem: ITransactionItem = {
			...nullFirst[0],
			...{
				id: approvalTransactionItemId,
				transaction_id: approvalTransactionId,
				creditor: "other"
			},
		};

		const testApproval: IApproval = { ...want };

		const got = approveItemOnAccount(
			approvalId,
			null, // ruleInstanceName not used
			null, // ruleInstanceRole not used
			testapprovername,
			singleTestItem,
			testApproval,
			testdebitor,
			testcreditor,
			c.CREDITOR,
			testapprovername,
		);
		expect(got).toEqual(want);
	});
});