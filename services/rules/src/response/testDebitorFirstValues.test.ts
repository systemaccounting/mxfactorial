import c from '../constants'
import testDebitorFirstValues from "./testDebitorFirstValues"
import crFirst from "../../../gopkg/testdata/crFirstTrItems.json"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"
import dbFirst from "../../../gopkg/testdata/dbFirstTrItems.json"
import fail from "../../../gopkg/testdata/failFirstTrItems.json"

describe('testDebitorFirstValues', () => {
	test('returns CREDITOR first SEQUENCE', () => {
		const noRef = [...c.SEQUENCE];
		const want = noRef.reverse();
		const got = testDebitorFirstValues(crFirst);
		expect(got).toEqual(want);
	});

	test('returns DEBITOR first CASES on null', () => {
		const want = [...c.SEQUENCE];
		const got = testDebitorFirstValues(nullFirst);
		expect(got).toEqual(want);
	});

	test('returns DEBITOR first CASES on true', () => {
		const want = [...c.SEQUENCE];
		const got = testDebitorFirstValues(dbFirst);
		expect(got).toEqual(want);
	});

	test('throws on inconsistent debitor_first values', () => {
		expect(() => testDebitorFirstValues(fail))
			.toThrow(c.INCONSISTENT_SEQUENCE_ERROR);
	});
});