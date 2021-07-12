import c from "../constants"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"
import getRulesPerApproval from './getRulesPerApproval';
import emptyRuleInstance from "../initial/ruleInstance.json"
import type { IPGClient } from "../index.d"

describe('getRulesPerApproval', () => {
	test('called with constants as query args', async () => {

		const testapprover = 'testapprover';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [testapprover],
			}));
		const client = { query: mockFn } as IPGClient;

		await getRulesPerApproval(client, c.CREDITOR, testapprover);

		expect(mockFn)
			.toHaveBeenCalledWith(ACCOUNT_ROLE_TRS_SQL,
				[c.APPROVAL, c.CREDITOR, testapprover]);
	});

	test('returns list of approval rules', async () => {

		const testapprover = 'testapprover';
		const want = Array(2).fill(emptyRuleInstance);
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: want,
			}));
		const client = { query: mockFn } as IPGClient;

		const got = await getRulesPerApproval(client, c.CREDITOR, testapprover);

		expect(got).toEqual(want);
	});
});