<script lang="ts">
	import Card from "./Card.svelte";
	import Info from "../components/Info.svelte";
	import { getClient } from "@urql/svelte";
	import BALANCE_QUERY from "../query/balance";
	const client = getClient();

	import { account as currentAccount } from "../stores/account";
	let balance = client
		.query(BALANCE_QUERY, {
			auth_account: $currentAccount,
			account_name: $currentAccount,
		})
		.toPromise();
</script>

<div data-id="balance">
	<Info label="account" value={$currentAccount} />
	<Card minHeight="2rem">
		<small>
			<span> Balance </span>
		</small>
		<p data-id="accountBalance">
			{#await balance}
				0.000
			{:then balance}
				{balance.data.balance}
			{:catch balance}
				{balance.error.message}
			{/await}
		</p>
	</Card>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0;
		color: rgb(161, 160, 160);
	}
	small {
		text-align: left;
		font-size: 1rem;
		margin-left: 0.3rem;
		font-weight: 600;
		color: rgb(156, 158, 164);
	}
	p {
		margin: 0;
		text-align: right;
		font-size: 1.25rem;
		font-weight: 600;
		font-family: sans-serif;
		color: rgb(156, 158, 164);
	}
</style>
