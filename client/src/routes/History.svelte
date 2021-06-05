<script lang="ts">
	import Balance from "../components/Balance.svelte";
	import { Link } from "svelte-navigator";
	import type { ITransaction } from "../main.d";
	import HistoryCard from "../components/HistoryCard.svelte";
	import {
		duplicateTransactionsPerRole,
		isCreditor,
		requestTime,
	} from "../utils/transactions";
	import { account as currentAccount } from "../stores/account";

	export let transactions: ITransaction[];

	let roleTransactions: ITransaction[] = duplicateTransactionsPerRole(
		$currentAccount,
		transactions
	);
</script>

<div>
	<Balance />
	<div class="container">
		{#each roleTransactions.sort((a, b) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		}) as tr, i}
			<Link to="/history/{tr.id}">
				<div class="history" data-id-index={i} data-id-tr={tr.id}>
					<HistoryCard
						contraAccount={$currentAccount == tr.author
							? $currentAccount
							: tr.author}
						isCurrentAccountCreditor={isCreditor(
							$currentAccount,
							tr.transaction_items
						)}
						equilibriumTime={requestTime(tr.transaction_items)}
						sumValue={tr.sum_value}
					/>
				</div>
			</Link>
		{/each}
	</div>
</div>

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
