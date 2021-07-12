import c from "../constants";
import addApprovalsAndRules from "./addApprovalsAndRules";
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json";
import { jest } from "@jest/globals"
import type { IPGClient } from "../index.d"

describe('addApprovalsAndRules', () => {
	test('calls getNamesFn with args 4 times', async () => {

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const mockGetNamesFn = jest.fn(() => Promise.resolve({})) as any;
		const testGetRulesFn = () => { };
		const testApplyRulesFn = () => { };
		const testItems = [...nullFirst];

		await addApprovalsAndRules(
			c.SEQUENCE,
			client,
			nullFirst,
			mockGetNamesFn,
			testGetRulesFn,
			testApplyRulesFn,
		);

		expect(mockGetNamesFn)
			.toHaveBeenNthCalledWith(1, client, testItems[0].debitor);
		expect(mockGetNamesFn)
			.toHaveBeenNthCalledWith(2, client, testItems[1].debitor);
		expect(mockGetNamesFn)
			.toHaveBeenNthCalledWith(3, client, testItems[0].creditor);
		expect(mockGetNamesFn)
			.toHaveBeenNthCalledWith(4, client, testItems[1].creditor);
	});

	test('calls getRulesFn with args 8 times', async () => {
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const testaccounts = ['GroceryCo', 'JohnSmith'];
		const mockGetNamesFn = jest.fn(() => Promise.resolve(
			[
				testaccounts[0],
				testaccounts[1],
			]
		));
		const mockGetRulesFn = jest.fn();
		const testApplyRulesFn = () => { };
		const testItems = [...nullFirst];

		await addApprovalsAndRules(
			c.SEQUENCE,
			client,
			testItems,
			mockGetNamesFn,
			mockGetRulesFn,
			testApplyRulesFn,
		);

		for (let i = 0; i < 4; i++) {
			expect(mockGetRulesFn.mock.calls[i][0]).toBe(client);
			expect(mockGetRulesFn.mock.calls[i][1]).toBe(c.DEBITOR);
			expect(mockGetRulesFn.mock.calls[i][2]).toBe(testaccounts[i % 2]);
		};
		for (let j = 4; j < 8; j++) {
			expect(mockGetRulesFn.mock.calls[j][0]).toBe(client);
			expect(mockGetRulesFn.mock.calls[j][1]).toBe(c.CREDITOR);
			expect(mockGetRulesFn.mock.calls[j][2]).toBe(testaccounts[j % 2]);
		};
	});

	test('returns items with approvals', async () => {
		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const testaccounts = ['GroceryStore', 'JacobWebb'];
		const testapproval = { approval: testaccounts[0] };
		const mockGetNamesFn = jest.fn(() => Promise.resolve(
			[
				testaccounts[0],
				testaccounts[1],
			]
		));
		const mockGetRulesFn = jest.fn();
		const mockApplyRulesFn = jest.fn(() => testapproval);

		const testItems = [...nullFirst];

		const got = await addApprovalsAndRules(
			c.SEQUENCE,
			client,
			testItems,
			mockGetNamesFn,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		const want = new Array();

		// deep copy testItems into want
		for (const i of testItems) {
			const j = Object.assign({}, i);
			want.push(j);
		};

		// add approvals to want
		for (const w of want) {
			for (let x = 0; x < 4; x++) {
				w.approvals.push(testapproval);
			};
		};

		expect(got).toEqual(want);
	});
});