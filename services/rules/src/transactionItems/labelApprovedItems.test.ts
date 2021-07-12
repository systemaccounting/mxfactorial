import c from "../constants"
import labelApprovedItems from "./labelApprovedItems"
import wAppr from "../../../gopkg/testdata/trItemWAppr.json"
import wZeroAppr from "../../../gopkg/testdata/trItemWZeroAppr.json"
import type { ITransactionItem } from "../index.d"

describe('labelApprovedItems', () => {
	test('returns item labeled as approved', () => {
		const want = Object.assign({}, wAppr);
		want.debitor_approval_time = c.CURRENT_TIMESTAMP
		want.creditor_approval_time = c.CURRENT_TIMESTAMP
		const got = labelApprovedItems([wAppr], c.SEQUENCE);
		expect(got).toEqual([want]);
	});

	test('timestamps NOT added', () => {
		const want = Object.assign({}, wZeroAppr);
		want.debitor_approval_time = null
		want.creditor_approval_time = null
		const got = labelApprovedItems([wZeroAppr], c.SEQUENCE);
		expect(got).toEqual([want]);
	});
});