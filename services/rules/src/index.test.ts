import nullFirstTrItems from "../../gopkg/testdata/nullFirstTrItems.json"
import transWAppr from "../../gopkg/testdata/transWAppr.json"
import { IIntraTransaction } from "./index.d"
import emptyTransaction from "./initial/transaction.json"

const testerror: string = 'testerror'

const testresponse: IIntraTransaction = {
	auth_account: null,
	transaction: {
		...emptyTransaction,
		sum_value: "0.000",
		transaction_items: transWAppr.transaction.transaction_items
	},
}

const mockDbQuery = jest.fn().mockImplementation(() => ({ rows: [] }));
const mockDbRelease = jest.fn();
const mockConnection = {
	query: mockDbQuery,
	release: mockDbRelease
};
const mockDbConnect = jest.fn().mockImplementation(() => mockConnection);
const mockDbEnd = jest.fn();
jest.mock('./db/index', () => ({
	connect: mockDbConnect,
	end: mockDbEnd,
}));

const mockAddRuleItems = jest.fn()
	.mockImplementationOnce(() => { throw new Error(testerror) })
	.mockImplementation(() => ([]));
jest.mock('./transactionItems/addRuleItems', () => mockAddRuleItems);

const mockAddApprovalsAndRules = jest.fn()
	.mockImplementationOnce(() => { throw new Error(testerror) })
	.mockImplementation(() => transWAppr.transaction.transaction_items);
jest.mock('./approvals/addApprovalsAndRules', () => mockAddApprovalsAndRules);


const mockTestDebitorFirstValues = jest.fn().mockImplementationOnce(() => {
	throw new Error('inconsistent debitor_first values')
});
jest.mock('./response/testDebitorFirstValues', () => mockTestDebitorFirstValues);

const mockLabelApprovedItems = jest.fn().mockImplementation(() => ([]));
jest.mock('./transactionItems/labelApprovedItems', () => mockLabelApprovedItems);

const mockCreateResponse = jest.fn().mockImplementation(() => testresponse);
jest.mock('./response/createResponse', () => mockCreateResponse);

beforeEach(() => {
	jest.clearAllMocks();
});

describe('rules function handler', () => {
	test('returns null on empty event', async () => {
		const { handler } = await import('./index');
		const got = await handler([]);
		expect(got).toBe(null);
	});

	test(
		'returns unchanged request on testDebitorFirstValues fail',
		async () => {
			const { handler } = await import('./index');
			const got = await handler(nullFirstTrItems);
			expect(got).toEqual(testresponse);
		});

	test('calls db pool connect', async () => {
		const { handler } = await import('./index');
		await handler(nullFirstTrItems);
		expect(mockDbConnect).toHaveBeenCalled();
	});

	test(
		'returns unchanged request when addRuleItems throws and releases db client',
		async () => {
			const { handler } = await import('./index');
			const got = await handler(nullFirstTrItems);
			expect(got).toBe(testresponse);
			expect(mockDbRelease).toHaveBeenCalled();
		});

	test('returns error when mockAddApprovalsAndRules throws and ends db session', async () => {
		const { handler } = await import('./index');
		const got = await handler(nullFirstTrItems);
		expect(got).toBe(testresponse);
		expect(mockDbRelease).toHaveBeenCalled();
	});

	test('calls testDebitorFirstValues with args', async () => {
		const { handler } = await import('./index');
		await handler(nullFirstTrItems);
		expect(mockTestDebitorFirstValues)
			.toHaveBeenCalledWith(nullFirstTrItems);
	});

	test('calls addRuleItems with args', async () => {
		const { handler } = await import('./index');
		await handler(nullFirstTrItems);
		expect(mockAddRuleItems.mock.calls[0][2])
			.toEqual(nullFirstTrItems);
		expect(mockAddRuleItems.mock.calls[0].length)
			.toBe(6);
	});

	test('calls end on db client', async () => {
		const { handler } = await import('./index');
		await handler(nullFirstTrItems);
		expect(mockDbEnd).toHaveBeenCalled();
	});

	test('calls labelApprovedItems with args', async () => {
		const { handler } = await import('./index');
		await handler(nullFirstTrItems);
		expect(mockLabelApprovedItems.mock.calls[0][0]).toEqual(transWAppr.transaction.transaction_items);
		expect(mockLabelApprovedItems.mock.calls[0].length).toBe(2);
	});

	test('returns labelApprovedItems in IntraTransaction object', async () => {
		const { handler } = await import('./index');
		const got = await handler(nullFirstTrItems);
		expect(got).toEqual(testresponse);
	});
});