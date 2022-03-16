import c from "../constants"
import APPROVAL_SQL from "../sql/selectApproval"
import getItemApprovalNames from './getItemApprovalNames'
import type { IPGClient } from "../index.d"

describe('getItemApprovalNames', () => {
	test('called with constants as query args', async () => {
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [{ approver: testownedaccount }]
			}));
		const client = { query: mockFn } as IPGClient;
		await getItemApprovalNames(client, testownedaccount);

		await expect(mockFn)
			.toHaveBeenCalledWith(APPROVAL_SQL, [testownedaccount]);
	});

	test('returns empty list', async () => {
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [] // empty return
			}));
		const client = { query: mockFn } as IPGClient;
		const got = await getItemApprovalNames(client, testownedaccount);

		expect(got).toEqual([]);
	});

	test('returns list of item approval names', async () => {
		const want = ['JoeCarter', 'IrisLynn', 'DanLee'];
		const testownedaccount = 'testownedaccount';
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({
				rows: [
					{ approver: want[0] },
					{ approver: want[1] },
					{ approver: want[2] },
				]
			}));
		const client = { query: mockFn } as IPGClient;

		const got = await getItemApprovalNames(client, testownedaccount);

		expect(got).toEqual(want);
	});
});