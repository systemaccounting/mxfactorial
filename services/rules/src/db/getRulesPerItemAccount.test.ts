import c from "../constants"
import ACCOUNT_PROFILE_SQL from "../sql/selectAccountProfile"
import STATE_NAME_TRS_SQL from "../sql/selectStateNameTrs"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"
import type { Client } from "pg"
import { jest } from "@jest/globals"

describe('getRulesPerItemAccount', () => {
	test('called with constants as query args', async () => {

		const teststate = "teststate";
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [{ state_name: teststate }],
			}));
		const client = { query: mockFn } as Client;

		const testapprover = 'testapprover';
		const { default: getRulesPerItemAccount } = await import("./getRulesPerItemAccount");

		await getRulesPerItemAccount(client, c.CREDITOR, testapprover);

		expect(mockFn)
			.toHaveBeenNthCalledWith(1, ACCOUNT_PROFILE_SQL, [testapprover]);
		expect(mockFn)
			.toHaveBeenNthCalledWith(2, STATE_NAME_TRS_SQL, [c.TRANSACTION_ITEM, c.CREDITOR, teststate]);
		expect(mockFn)
			.toHaveBeenNthCalledWith(3, ACCOUNT_ROLE_TRS_SQL, [c.TRANSACTION_ITEM, c.CREDITOR, testapprover]);
	});

	test('returns list of item approver names', async () => {

		const testapprover = 'testapprover';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [testapprover],
			}));
		const client = { query: mockFn } as Client;
		const { default: getRulesPerItemAccount } = await import("./getRulesPerItemAccount");
		const got = await getRulesPerItemAccount(client, c.CREDITOR, testapprover);

		expect(got).toEqual(Array(2).fill(testapprover));
	});
});