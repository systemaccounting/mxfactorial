<script lang="ts">
	import { Pulse } from "svelte-loading-spinners";
	import { operationStore, query } from "@urql/svelte";
	import { account as currentAccount } from "../stores/account";
	import REQUESTS_BY_ACCOUNT_QUERY from "../query/requestsByAccount";

	const requests = operationStore(REQUESTS_BY_ACCOUNT_QUERY, {
		auth_account: $currentAccount,
		account_name: $currentAccount,
	});
	query(requests);
</script>

<div class="requests">
	<div class="container">
		{#if $requests.fetching}
			<div class="loading">
				<Pulse color="#fff" />
			</div>
		{:else if $requests.error}
			<p>error... {$requests.error.message}</p>
		{:else if $requests.data.requestsByAccount}
			<slot requests={requests.data.requestsByAccount} />
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
