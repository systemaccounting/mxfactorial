import testRequest from './testRequest';
import { Request, Response, NextFunction } from 'express';

describe('testRequest', () => {
	test('returns 400 when req.body is NOT array', () => {
		const mockRequest = {
			body: ""
		} as unknown as Request;
		const mockResponse = {
			sendStatus: jest.fn()
		} as unknown as Response;
		const mockNextFn = jest.fn() as NextFunction;

		testRequest(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.sendStatus).toHaveBeenCalledWith(400)
	})

	test('returns 400 when req.body is null', () => {
		const mockRequest = {
			body: null
		} as unknown as Request;
		const mockResponse = {
			sendStatus: jest.fn()
		} as unknown as Response;
		const mockNextFn = jest.fn() as NextFunction;

		testRequest(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.sendStatus).toHaveBeenCalledWith(400)
	})

	test('returns 400 when req.body is empty array', () => {
		const mockRequest = {
			body: []
		} as unknown as Request;
		const mockResponse = {
			sendStatus: jest.fn()
		} as unknown as Response;
		const mockNextFn = jest.fn() as NextFunction;

		testRequest(mockRequest, mockResponse, mockNextFn);

		expect(mockResponse.sendStatus).toHaveBeenCalledWith(400)
	})

	test('calls next function', () => {
		const mockRequest = {
			body: [{}]
		} as unknown as Request;
		const mockResponse = {
			sendStatus: jest.fn()
		} as unknown as Response;
		const mockNextFn = jest.fn() as NextFunction;

		testRequest(mockRequest, mockResponse, mockNextFn);

		expect(mockNextFn).toHaveBeenCalled()
	})
})