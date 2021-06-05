<script lang="ts">
	import { operationStore, query } from "@urql/svelte";
	import type { ITransactionItem } from "../main.d";
	import {
		disableButton,
		accountValuesPresent,
		filterUserAddedItems,
	} from "../utils/transactions";
	import RULES_QUERY from "../query/rules";

	import request from "../stores/request";

	let reqItems: ITransactionItem[];

	request.subscribe(function (requestItems: ITransactionItem[]): void {
		let userAdded = filterUserAddedItems(requestItems);
		// fetch new rules only when all request item and
		// recipient inputs on home screen receive values
		if (!disableButton(userAdded) && accountValuesPresent(userAdded)) {
			// console.log("sending");
			reqItems = userAdded;
		}
	});

	let ruleItems = operationStore(RULES_QUERY, {
		transaction_items: reqItems,
	});

	query(ruleItems);

	$: console.log(
		JSON.stringify({
			transaction_items: reqItems,
		})
	);

	$: ruleItems.set({
		query: RULES_QUERY,
		variables: {
			transaction_items: reqItems,
		},
	});

	$: if ($ruleItems.fetching) {
	} else if ($ruleItems.error) {
		console.log("error fetching rules");
	} else if (!$ruleItems.data.rules) {
		console.log("empty response from rules");
	} else {
		request.addRuleItems($ruleItems.data.rules.transaction_items);
	}
</script>
