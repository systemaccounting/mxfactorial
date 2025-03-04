<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import Balance from '../../components/Balance.svelte';
	import HistoryCard from '../../components/HistoryCard.svelte';
	import { isCreditor, requestTime, getTransContraAccount } from '../../utils/transactions';
	import { page } from '$app/state';
</script>

<Nav>
	{#snippet children()}
		<Balance />
		<div class="container">
			{#each page.data.transactions as tr, i}
				<a href={'/history/' + tr['id']}>
					<div class="history" data-id-index={i} data-id-tr={tr.id}>
						<HistoryCard
							contraAccount={getTransContraAccount(page.data.account, tr)}
							isCurrentAccountCreditor={isCreditor(page.data.account, tr.transaction_items)}
							equilibriumTime={requestTime(tr.transaction_items)}
							sumValue={tr.sum_value}
						/>
					</div>
				</a>
			{/each}
		</div>
	{/snippet}
</Nav>

<style>
	.history {
		margin: 0.8rem 0 0 0;
		padding: 0;
		border: 0;
	}
	.container {
		padding: 0;
		border: 0;
		margin: 2rem 0 0 0;
	}
</style>
