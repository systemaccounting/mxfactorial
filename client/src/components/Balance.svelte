<script lang="ts">
	import Card from './Card.svelte';
	import Info from './Info.svelte';
	import { account as currentAccount } from '../stores/account';
	import BALANCE_QUERY from '../query/balance';
	import type { Client } from '@urql/core';
	import { getContext } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	let client: Client = getContext('client');

	let balance = '0.000';

	afterNavigate(async () => {
		let res = await client
			.query(BALANCE_QUERY, {
				auth_account: $currentAccount,
				account_name: $currentAccount
			})
			.toPromise();
		balance = res.data.balance;
	});
</script>

<div data-id="balance">
	<Info label="account" value={$currentAccount} />
	<Card minHeight="2rem">
		<small>
			<span> Balance </span>
		</small>
		<p data-id="accountBalance">{balance}</p>
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
