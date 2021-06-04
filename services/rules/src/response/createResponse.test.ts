import type { IIntraTransaction } from "../index.d"
import createResponse from "./createResponse"
import nullFirst from "../../../gopkg/testdata/nullFirstTrItems.json"

describe('createResponse', () => {
	test('returns intraTransaction', () => {
		const got: IIntraTransaction = createResponse(nullFirst);
		expect(got).toEqual(expected);
	});

	// todo: negative cases
});

const expected: IIntraTransaction = {
	auth_account: null,
	transaction: {
		id: null,
		rule_instance_id: null,
		author: null,
		author_device_id: null,
		author_device_latlng: null,
		author_role: null,
		equilibrium_time: null,
		sum_value: "18.000",
		transaction_items: nullFirst
	}
}