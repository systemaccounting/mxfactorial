import c from "../constants"
import APPROVAL_SQL from "../sql/selectApproval"
import getItemApprovalNames from './getItemApprovalNames'
import type { Client } from "pg"

describe('getItemApprovalNames', () => {
	test('called with constants as query args', async () => {
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [{ approver: testownedaccount }]
			}));
		const client = { query: mockFn } as Client;
		await getItemApprovalNames(client, testownedaccount);

		await expect(mockFn)
			.toHaveBeenCalledWith(APPROVAL_SQL, [testownedaccount]);
	});

	test('throws on zero approval rows returned from query', async () => {
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [] // empty to throw
			}));
		const client = { query: mockFn } as Client;

		await expect(
			getItemApprovalNames(client, testownedaccount)
		).rejects.toThrow(c.APPROVAL_COUNT_ERROR);
	});

	test('returns list of item approval names', async () => {
		const want = ['JohnSmith', 'IrisLynn', 'DanLee'];
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [
					{ approver: want[0] },
					{ approver: want[1] },
					{ approver: want[2] },
				]
			}));
		const client = { query: mockFn } as Client;

		const got = await getItemApprovalNames(client, testownedaccount);

		expect(got).toEqual(want);
	});
});