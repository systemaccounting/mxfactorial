import applyRules from "./applyRules"
import nullFirstTrItems from "../../../gopkg/testdata/nullFirstTrItems.json"
import emptyTransaction from "../initial/transaction.json"
import { Request, Response, NextFunction } from "express"
import { IIntraTransaction } from "../index.d"
import c from "../constants"
import { jest } from '@jest/globals';

import mockDb from "../db/index"
import mockTestDebitorFirstValues from "../response/testDebitorFirstValues"
import mockAddRuleItems from "../transactionItems/addRuleItems"
import mockLabelApprovedItems from "../transactionItems/labelApprovedItems"

beforeEach(() => {
	jest.clearAllMocks();
});

const testerror: string = 'testerror';

const unchangedresponse: IIntraTransaction = {
	auth_account: null,
	transaction: {
		...emptyTransaction,
		sum_value: "18.000",
		transaction_items: nullFirstTrItems
	},
};

jest.mock('../response/testDebitorFirstValues', () => jest.fn()
.mockImplementationOnce(() => {
	throw new Error('inconsistent debitor_first values')
})
.mockImplementation(() => c.SEQUENCE)
);

const mockConnection = {
	query: jest.fn<() => Promise<any>>().mockResolvedValue({ rows: [] }),
	release: jest.fn(() => Promise.resolve()),
};

jest.mock('../db/index', () => ({
	connect: jest.fn(() => Promise.resolve(mockConnection)),
	end: jest.fn(() => Promise.resolve()),
}));

jest.mock('../transactionItems/addRuleItems', () => jest.fn()
.mockImplementationOnce(() => Promise.resolve([]))
.mockImplementationOnce(() => { throw new Error(testerror) })
.mockImplementation(() => Promise.resolve([]))
);

jest.mock('../approvals/addApprovalsAndRules', () => jest.fn()
.mockImplementationOnce(() => Promise.resolve([]))
.mockImplementationOnce(() => { throw new Error(testerror) })
.mockImplementation(() => Promise.resolve([]))
);

jest.mock('../transactionItems/labelApprovedItems', () => jest.fn().mockImplementation(() => ([])));

describe('applyRules handler', () => {

	test('returns unchanged request after failing inconsistent debitor_first values test', async () => {

		const mockRequest = {
			body: nullFirstTrItems,
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.json).toHaveBeenCalledWith(unchangedresponse);
	});

	test('calls db pool connect', async () => {

		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockDb.connect).toHaveBeenCalledTimes(1);
	});

	test('returns unchanged request after addRuleItems throws and releases db client',
	async () => {

		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.json).toHaveBeenCalledWith(unchangedresponse);
		expect(mockConnection.release).toHaveBeenCalledTimes(1);
	});

	test('returns unchanged request after addApprovalsAndRules throws and releases db session', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.json).toHaveBeenCalledWith(unchangedresponse);
		expect(mockConnection.release).toHaveBeenCalledTimes(1);
	});

	test('calls testDebitorFirstValues with args', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockTestDebitorFirstValues)
			.toHaveBeenCalledWith(nullFirstTrItems);
	});

	test('calls addRuleItems with args', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		// https://stackoverflow.com/a/60300568
		expect((mockAddRuleItems as jest.Mock).mock.calls[0][2])
			.toEqual(nullFirstTrItems);
		expect((mockAddRuleItems as jest.Mock).mock.calls[0].length)
			.toBe(6);
	});

	test('calls end on db client', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		process.env.PG_DISCONNECT = "true"

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockDb.end).toHaveBeenCalledTimes(1);
	});

	test('calls labelApprovedItems with args', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect((mockLabelApprovedItems as jest.Mock).mock.calls[0][0]).toEqual([]);
		expect((mockLabelApprovedItems as jest.Mock).mock.calls[0].length).toBe(3);
	});

	test('returns labelApprovedItems in IntraTransaction object', async () => {
		const mockRequest = {
			body: nullFirstTrItems
		} as unknown as Request;

		const mockResponse = {
			json: jest.fn(),
		} as unknown as Response;

		const mockNextFn = jest.fn() as NextFunction;

		await applyRules(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.json).toHaveBeenCalledWith({
			auth_account: null,
			transaction: {
				...emptyTransaction,
				sum_value: "0.000",
				transaction_items: []
			},
		});
	});
});