import GET_RULES from "./query/getRules"
import nullFirstTrItemsNoAppr from "../../../gopkg/testdata/nullFirstTrItemsNoAppr.json"
import { createClient } from '@urql/core';
import type { Client, ClientOptions } from '@urql/core';
import type { ITransactionItem } from '../index.d'
import 'isomorphic-unfetch';

const resource = '/query'
const clientOptions: ClientOptions = {
	url: process.env.GRAPHQL_API + resource,
	maskTypename: true
}

let client: Client
let got: ITransactionItem[]
beforeAll(async () => {
	client = createClient(clientOptions);
	const { data: rules } = await client.query(
		GET_RULES,
		{ transaction_items: nullFirstTrItemsNoAppr })
		.toPromise();
	got = rules.rules.transaction_items
})

describe('tax rule returned by service', () => {

	test('adds 2 rule-generated objects', async () => {
		expect(got).toHaveLength(4)
	})

	test('1.620 summed tax price', async () => {
		const taxItems = got.filter(
			trItem => trItem.item_id === '9% state sales tax'
		)
		let tax: number = 0;
		for (let i = 0; i < taxItems.length; i++) {
			tax += parseFloat(taxItems[i].quantity) * parseFloat(taxItems[i].price)
		}
		expect(tax).toBe(1.62)
	});

});