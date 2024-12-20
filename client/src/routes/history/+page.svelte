<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import Balance from '../../components/Balance.svelte';
	import HistoryCard from '../../components/HistoryCard.svelte';
	import TRANSACTIONS_BY_ACCOUNT_QUERY from '../../graphql/query/transactionsByAccount';
	import client from '../../graphql/client';
	import {
		duplicateTransactionsPerRole,
		isCreditor,
		requestTime,
		getTransContraAccount
	} from '../../utils/transactions';
	import { account } from '../../stores/account';
	import { history } from '../../stores/history';

	async function getTransactionsByAccount(): Promise<App.ITransaction[]> {
		const variables = {
			auth_account: $account,
			account_name: $account
		};

		const res = await client.query(TRANSACTIONS_BY_ACCOUNT_QUERY, variables).toPromise();

		if (!res.data.transactionsByAccount || res.data.transactionsByAccount.length == 0) {
			history.set([]);
			return [];
		} else {
			let transactionsByAccount: App.ITransaction[];
			const transactionsPerRole = duplicateTransactionsPerRole(
				$account as unknown as string,
				res.data.transactionsByAccount
			); // duplicate transactions where account debitor and creditor

			transactionsByAccount = transactionsPerRole.sort(
				(a: App.ITransaction, b: App.ITransaction) => {
					if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
						return 1;
					}
					return -1;
				}
			);
			history.set(transactionsByAccount);
			return transactionsByAccount;
		}
	}
</script>

<Nav>
	{#snippet children()}
		<Balance />
		{#await getTransactionsByAccount() then transactionsByAccount}
			<div class="container">
				{#each transactionsByAccount as tr, i}
					<a href={'/history/' + tr['id']}>
						<div class="history" data-id-index={i} data-id-tr={tr.id}>
							<HistoryCard
								contraAccount={getTransContraAccount($account, tr)}
								isCurrentAccountCreditor={isCreditor($account, tr.transaction_items)}
								equilibriumTime={requestTime(tr.transaction_items)}
								sumValue={tr.sum_value}
							/>
						</div>
					</a>
				{/each}
			</div>
		{:catch error}
			<p>request failed: ${error.message}</p>
		{/await}
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
