import c from "../constants"
import addRuleItems from "./addRuleItems"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"
import type { IRuleInstance, IPGClient } from "../index.d"
import emptyRuleInstance from "../initial/ruleInstance.json"

describe('addRuleItems', () => {
	test('calls getProfilesFn with args 2 times', async () => {

		const testItems = [...nullFirst];
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const mockGetProfilesFn = jest.fn(() => Promise.resolve({}));
		const mockGetRulesFn = jest.fn(() => Promise.resolve({}));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetProfilesFn,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		expect(mockGetProfilesFn)
			.toHaveBeenNthCalledWith(
				1, client, testcreditor, testdebitor
			);
		expect(mockGetProfilesFn)
			.toHaveBeenNthCalledWith(
				2, client, testcreditor, testdebitor
			);
	});

	test('calls getRulesFn with args 4 times', async () => {
		const testItems = [...nullFirst];
		const teststate = 'California';
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const mockGetProfilesFn = jest.fn()
			.mockImplementation(
				() => [
					{
						state_name: teststate,
						account_name: testcreditor,
					},
					{
						state_name: teststate,
						account_name: testdebitor,
					},
				]
			);
		const mockGetRulesFn = jest.fn(() => Promise.resolve({}));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetProfilesFn,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(1, client, c.DEBITOR, teststate, testdebitor);
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(2, client, c.CREDITOR, teststate, testcreditor);
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(3, client, c.DEBITOR, teststate, testdebitor);
		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(4, client, c.CREDITOR, teststate, testcreditor);
	});

	test('calls getRulesFn once when debitor profile missing', async () => {
		const testItems = [...nullFirst];

		const teststate = 'California';
		const testcreditor = 'GroceryStore';

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const mockGetProfilesFn = jest.fn()
			.mockImplementation(
				() => [
					{
						state_name: teststate,
						account_name: testcreditor,
					},
					null,
				]
			);
		const mockGetRulesFn = jest.fn(() => Promise.resolve({}));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetProfilesFn,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		expect(mockGetRulesFn)
			.toHaveBeenNthCalledWith(1, client, c.CREDITOR, teststate, testcreditor);
	});

	test('calls applyRulesFn with args 4 times', async () => {
		const testItems = [...nullFirst];
		const teststate = 'California';
		const testdebitor = 'JacobWebb';
		const testcreditor = 'GroceryStore';

		const mockFn: any = jest.fn()
			.mockImplementation(() => ({ rows: [] }));
		const client = { query: mockFn } as IPGClient;

		const testrules: IRuleInstance[] = Array(1).fill(emptyRuleInstance);
		const mockGetProfilesFn = jest.fn()
			.mockImplementation(
				() => [
					{
						state_name: teststate,
						account_name: testcreditor,
					},
					{
						state_name: teststate,
						account_name: testdebitor,
					},
				]
			);
		const mockGetRulesFn = jest.fn(() => Promise.resolve(testrules));
		const mockApplyRulesFn = jest.fn(() => testItems);

		await addRuleItems(
			c.SEQUENCE,
			client,
			testItems,
			mockGetProfilesFn,
			mockGetRulesFn,
			mockApplyRulesFn,
		);

		for (let i = 0; i < 4; i++) {
			expect(mockApplyRulesFn)
				.toHaveBeenNthCalledWith(
					i + 1, testrules, i < 2 ? testItems[0] : testItems[1]
				)
		}
	});
});