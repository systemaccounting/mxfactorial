<script lang="ts">
	import Card from './Card.svelte';
	import { page } from '$app/state';
</script>

<div data-id="balance">
	<Card minHeight="2rem">
		<span class="header">{page.data.account} balance</span>
		<div class="value" data-id="accountBalance">{page.data.balance}</div>
	</Card>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0.5rem 0 0;
	}
	.header {
		display: block;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
		margin-bottom: 0.4rem;
		text-align: left;
	}
	.value {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
		text-align: right;
	}
</style>
