<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import Balance from '../../components/Balance.svelte';
	import HistoryCard from '../../components/HistoryCard.svelte';
	import { duplicateTransactionsPerRole, isCreditor, requestTime } from '../../utils/transactions';
	import { account as currentAccount } from '../../stores/account';
	import type { PageData } from './$types';

	export let data: PageData;

	let transactionsByAccount: App.ITransaction[];

	if (data.transactionsByAccount) {
		const transactionsPerRole = duplicateTransactionsPerRole(
			$currentAccount as unknown as string,
			data.transactionsByAccount
		); // duplicate transactions where account debitor and creditor

		transactionsByAccount = transactionsPerRole.sort((a: App.ITransaction, b: App.ITransaction) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		});
	}
</script>

<Nav>
	<Balance />
	{#if transactionsByAccount}
		<div class="container">
			{#each transactionsByAccount as tr, i}
				<a href={'/history/' + tr['id']}>
					<div class="history" data-id-index={i} data-id-tr={tr.id}>
						<HistoryCard
							contraAccount={$currentAccount == tr.author ? $currentAccount : tr.author}
							isCurrentAccountCreditor={isCreditor($currentAccount, tr.transaction_items)}
							equilibriumTime={requestTime(tr.transaction_items)}
							sumValue={tr.sum_value}
						/>
					</div>
				</a>
			{/each}
		</div>
	{/if}
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
