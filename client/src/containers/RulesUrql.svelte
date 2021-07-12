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

	const rulesRequestTimeBufferMs = 1000;

	let minRequestTime;
	let reqItems: ITransactionItem[];
	let previouslySubmitted = ""; // used to send rules request only on diff

	request.subscribe(function (requestItems: ITransactionItem[]): void {
		let userAdded = filterUserAddedItems(requestItems);

		minRequestTime = new Date(
			new Date().getTime() + rulesRequestTimeBufferMs
		);

		setTimeout(() => {
			// fetch new rules only when all request item and
			// recipient inputs on home screen receive values

			if (
				!disableButton(userAdded) &&
				accountValuesPresent(userAdded) &&
				// send only latest version of user added
				// items after 1 second of no input
				new Date().getTime() > minRequestTime.getTime() &&
				previouslySubmitted != JSON.stringify(userAdded)
			) {
				// console.log("sending");
				reqItems = userAdded;
				previouslySubmitted = JSON.stringify(userAdded); // store sent request for diff
			}
		}, rulesRequestTimeBufferMs + 5);
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
		console.log("error fetching rules: ", $ruleItems.error);
	} else if (!$ruleItems.data.rules) {
		console.log("empty response from rules");
	} else {
		request.addRuleItems($ruleItems.data.rules.transaction_items);
	}
</script>
