import type { ITransactionItem } from "./index.d"
import test from "../../gopkg/testdata/bottledWater.json"
import { handler } from "./index"

const event: ITransactionItem[] = test;

// invokes function during local development
(async function () {
	const response = await handler(event);
	// test for error string return value
	if (typeof response == "string") {
		console.log(response);
	} else {
		// or print transaction
		console.log(response);
		for (const item of response.transaction.transaction_items) {
			// and print transaction items
			console.log(item);
		};
	};
})();