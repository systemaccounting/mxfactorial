import axios from "axios";
import type { ITransactionItem } from "../index.d"

import nullFirstTrItemsNoAppr from "../../../gopkg/testdata/nullFirstTrItemsNoAppr.json"

describe("rules", () => {

	it("adds 2 rule objects", async () => {
		await process.nextTick(() => {})
		let { data } = await axios.post("http://localhost:8081/", nullFirstTrItemsNoAppr)
		expect(data.transaction.transaction_items).toHaveLength(4)
	})

	it('1.620 summed tax price', async () => {
		await process.nextTick(() => {})
		let { data } = await axios.post("http://localhost:8081/", nullFirstTrItemsNoAppr)

		let trItems: ITransactionItem[] = data.transaction.transaction_items;

		const taxItems: ITransactionItem[] = trItems.filter(
			trItem => trItem.item_id === '9% state sales tax'
		)

		let tax: number = 0;

		for (let i = 0; i < taxItems.length; i++) {
			tax += parseFloat(taxItems[i].quantity) * parseFloat(taxItems[i].price)
		}

		expect(tax).toBe(1.62)
	});
})