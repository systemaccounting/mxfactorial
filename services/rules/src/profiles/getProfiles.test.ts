import c from "../constants"
import ACCOUNT_PROFILE_SQL from "../sql/selectAccountProfile"
import type { IPGClient } from "../index.d"

const testcreditor = 'GroceryStore'
const testdebitor = 'JabobWebb'

describe('getProfiles', () => {
	test('calls query twice with creditor and debitor args', async () => {

		const mockQuery: any = jest.fn()
			.mockImplementation(() => ({
				rows: [],
			}));
		const client = { query: mockQuery } as IPGClient;

		const { default: getProfiles } = await import("./getProfiles");

		await getProfiles(
			client,
			testcreditor,
			testdebitor);

		expect(mockQuery)
			.toHaveBeenNthCalledWith(
				1, ACCOUNT_PROFILE_SQL, [testcreditor]
			);

		expect(mockQuery)
			.toHaveBeenNthCalledWith(
				2, ACCOUNT_PROFILE_SQL, [testdebitor]
			);
	});

	test('empty profile queries returns two nulls in a list', async () => {

		const mockQuery: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));

		const client = { query: mockQuery } as IPGClient;

		const { default: getProfiles } = await import("./getProfiles");

		const got = await getProfiles(
			client,
			testcreditor,
			testdebitor,
		);

		expect(got).toEqual([null, null]);
	});
});