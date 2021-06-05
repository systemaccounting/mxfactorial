<script lang="ts">
	import { Pulse } from "svelte-loading-spinners";
	import { operationStore, query } from "@urql/svelte";
	import TRANSACTIONS_BY_ACCOUNT_QUERY from "../query/transactionsByAccount";
	import { account as currentAccount } from "../stores/account";
	const queryVars = {
		auth_account: $currentAccount,
		account_name: $currentAccount,
	};
	console.log("query vars ", queryVars);
	const history = operationStore(TRANSACTIONS_BY_ACCOUNT_QUERY, queryVars);
	query(history);
	console.log($history);
</script>

<div class="transactions">
	<div class="container">
		{#if $history.fetching}
			<div class="loading">
				<Pulse color="#fff" />
			</div>
		{:else if $history.error}
			<p>error... {$history.error.message}</p>
		{:else if $history.data.transactionsByAccount}
			<slot transactions={$history.data.transactionsByAccount} />
		{/if}
	</div>
</div>

<style>
	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
	}

	.loading {
		padding: 0;
		border: 0;
		margin: 12rem 0 0 0;
		display: flex;
		justify-content: center;
	}
</style>
