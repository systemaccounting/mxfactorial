import c from "../constants"
import STATE_NAME_TRS_SQL from "../sql/selectStateNameTrs"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"
import type { IPGClient } from "../index.d"
import { jest } from "@jest/globals"

describe('getRulesPerItemAccount', () => {
	test('called with constants as query args', async () => {

		const teststate = "teststate";
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [{ state_name: teststate }],
			}));
		const client = { query: mockFn } as IPGClient;

		const testapprover = 'testapprover';
		const { default: getRulesPerItemAccount } = await import("./getRulesPerItemAccount");

		await getRulesPerItemAccount(
			client,
			c.CREDITOR,
			teststate,
			testapprover);

		expect(mockFn)
			.toHaveBeenNthCalledWith(1, STATE_NAME_TRS_SQL, [c.TRANSACTION_ITEM, c.CREDITOR, teststate]);
		expect(mockFn)
			.toHaveBeenNthCalledWith(2, ACCOUNT_ROLE_TRS_SQL, [c.TRANSACTION_ITEM, c.CREDITOR, testapprover]);
	});

	test('returns list of item approver names', async () => {

		const testapprover = 'testapprover';
		const teststate = 'teststate';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [testapprover],
			}));
		const client = { query: mockFn } as IPGClient;

		const { default: getRulesPerItemAccount } = await import("./getRulesPerItemAccount");

		const got = await getRulesPerItemAccount(
			client,
			c.CREDITOR,
			teststate,
			testapprover,
		);

		expect(got).toEqual(Array(2).fill(testapprover));
	});
});