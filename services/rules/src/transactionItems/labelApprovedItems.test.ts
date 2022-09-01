import c from "../constants"
import labelApprovedItems from "./labelApprovedItems"
import wAppr from "../../../gopkg/testdata/trItemWAppr.json"
import wZeroAppr from "../../../gopkg/testdata/trItemWZeroAppr.json"
import type { ITransactionItem } from "../index.d"

describe('labelApprovedItems', () => {
	test('returns item labeled as approved', () => {
		const want = Object.assign({}, wAppr);
		const testapprovaltime = new Date().toISOString();
		want.debitor_approval_time = testapprovaltime
		want.creditor_approval_time = testapprovaltime
		const got = labelApprovedItems(
			[wAppr],
			c.SEQUENCE,
			testapprovaltime);
		expect(got).toEqual([want]);
	});

	test('timestamps NOT added', () => {
		const want = Object.assign({}, wZeroAppr);
		want.debitor_approval_time = null
		want.creditor_approval_time = null
		const got = labelApprovedItems([wZeroAppr], c.SEQUENCE, null);
		expect(got).toEqual([want]);
	});
});