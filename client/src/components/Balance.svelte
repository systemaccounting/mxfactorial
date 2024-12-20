<script lang="ts">
	import Card from './Card.svelte';
	import Info from './Info.svelte';
	import { account } from '../stores/account';
	import BALANCE_QUERY from '../graphql/query/balance';
	import type { Client } from '@urql/core';
	import { getContext, onMount } from 'svelte';
	import c from '../utils/constants';

	let client: Client = getContext(c.CLIENT_CTX_KEY);

	async function getBalance(): Promise<string> {
		let res = await client
			.query(BALANCE_QUERY, {
				auth_account: $account,
				account_name: $account
			})
			.toPromise();

		return res.data.balance;
	}

	// wait for account if browser page refreshed
	let mounted = false;
	onMount(() => (mounted = true));
</script>

{#if mounted}
	<div data-id="balance">
		<Info label="account" value={$account} />
		<Card minHeight="2rem">
			{#snippet children()}
				<small>
					<span> Balance </span>
				</small>
				{#await getBalance()}
					<p data-id="accountBalance">0.000</p>
				{:then balance}
					<p data-id="accountBalance">{balance}</p>
				{:catch error}
					{alert(error.message)}
					<p data-id="accountBalance">0.000</p>
				{/await}
			{/snippet}
		</Card>
	</div>
{/if}

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
