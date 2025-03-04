<script lang="ts">
	import Card from './Card.svelte';
	import Info from './Info.svelte';
	import { page } from '$app/state';
</script>

<div data-id="balance">
	<Info label="account" value={page.data.account} />
	<Card minHeight="2rem">
		{#snippet children()}
			<small>
				<span> Balance </span>
			</small>
			<p data-id="accountBalance">{page.data.balance}</p>
		{/snippet}
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
