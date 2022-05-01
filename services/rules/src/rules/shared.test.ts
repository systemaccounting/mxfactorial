import {
	stringIfNull,
	stringIfNumber,
	numberToFixedString,
	createRuleExecID,
} from "./shared"

describe('shared rules functions', () => {
	test('stringIfNull returns string if null', () => {
		expect(stringIfNull(null)).toBe("")
	});
	test('stringIfNull returns string if sting', () => {
		expect(stringIfNull("")).toBe("")
	});
	test('stringIfNumber returns string if number', () => {
		expect(stringIfNumber(2)).toBe("2")
	});
	test('stringIfNumber returns string if string', () => {
		expect(stringIfNumber("2")).toBe("2")
	});
	test('numberToFixedString returns 3 decimal string if number', () => {
		expect(numberToFixedString(3)).toBe("3.000")
	});
	test('createRuleExecID returns 8 character id', () => {
		expect(createRuleExecID().length).toBe(8)
	});
});