<script lang="ts">
	import { disableButton, accountValuesPresent, filterUserAddedItems } from '../utils/transactions';
	import request from '../stores/request';
	import QueryRules from './QueryRules.svelte';

	const rulesRequestTimeBufferMs = 1000;

	let minRequestTime: Date;
	let reqItems: App.ITransactionItem[];
	let render: boolean;
	let previouslySubmitted = ''; // used to send rules request only on diff

	request.subscribe(function (requestItems: App.ITransactionItem[]): void {
		let userAdded = filterUserAddedItems(requestItems);

		minRequestTime = new Date(new Date().getTime() + rulesRequestTimeBufferMs);

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
				// console.log('sending');
				render = true;
				reqItems = userAdded;
				previouslySubmitted = JSON.stringify(userAdded); // store sent request for diff
			}
		}, rulesRequestTimeBufferMs + 5);
	});
</script>

{#if render}
	<QueryRules {reqItems} />
{/if}
