import { jest } from "@jest/globals"

// global mocks enable testing of dynamically imported rules

Object.defineProperty(global, "applyItemRuleMockFn", {
	value: jest.fn(),
	writable: false,
})

Object.defineProperty(global, "applyApproverRuleMockFn", {
	value: jest.fn(),
	writable: false,
})