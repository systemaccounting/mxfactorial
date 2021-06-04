import c from "../constants"
import addRuleItems from "./addRuleItems"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"
import type { IRuleInstance, db } from "../index.d"
import emptyRuleInstance from "../initial/ruleInstance.json"

describe('addRuleItems', () => {
	test('calls getRulesFn with args 4 times', async () => {
		const testItems = [...nullFirst];

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as db;

		const mockGetRulesFn = jest.fn(() => Promise.resolve({}));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(1, client, c.DEBITOR, 'JacobWebb');
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(2, client, c.DEBITOR, 'JacobWebb');
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(3, client, c.CREDITOR, 'GroceryStore');
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(4, client, c.CREDITOR, 'GroceryStore');
	});

	test('returns getRulesFn throw', async () => {
		const testItems = [...nullFirst];

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { end: mockFn } as db;

		const mockGetRulesFn = jest.fn(() => Promise.reject(new Error()));
		const mockApplyRulesFn = jest.fn(() => testItems);
		const got = await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetRulesFn,
			mockApplyRulesFn,
		);
		expect(got).toBe('Error');

	});

	test('calls applyRulesFn with args 4 times', async () => {
		const testItems = [...nullFirst];

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { end: mockFn } as db;

		const testrules: IRuleInstance[] = Array(1).fill(emptyRuleInstance);
		const mockGetRulesFn = jest.fn(() => Promise.resolve(testrules));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		for (let i = 0; i < 4; i++) {
			expect(mockApplyRulesFn)
				.toHaveBeenNthCalledWith(i + 1, testrules, testItems[i % 2]);
		};
	});
});