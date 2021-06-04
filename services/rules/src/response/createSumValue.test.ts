import createSumValue from "./createSumValue"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"

describe('createSumValue', () => {
	test('returns sum of quantity multiplied by price', () => {
		const got = createSumValue(nullFirst);
		expect(got).toEqual("18.000");
	});

	// todo: negative cases
});