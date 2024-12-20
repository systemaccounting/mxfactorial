<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import SwitchButtons from '../../components/SwitchButtons.svelte';
	import RequestCard from '../../components/RequestCard.svelte';
	import {
		isCreditor,
		isRejected,
		requestTime,
		getTransContraAccount
	} from '../../utils/transactions';
	import { account } from '../../stores/account';
	import { duplicateRequestsPerRole } from '../../utils/transactions';
	import { requestsPending } from '../../stores/requestsPending';
	import REQUESTS_BY_ACCOUNT_QUERY from '../../graphql/query/requestsByAccount';
	import client from '../../graphql/client';

	async function getRequestsByAccount(): Promise<App.ITransaction[]> {
		const variables = {
			auth_account: $account,
			account_name: $account
		};

		const res = await client.query(REQUESTS_BY_ACCOUNT_QUERY, variables).toPromise();

		if (!res.data.requestsByAccount || res.data.requestsByAccount.length == 0) {
			requestsPending.set([]);
			return [];
		} else {
			let requestsByAccount: App.ITransaction[];
			const requestsPerRole = duplicateRequestsPerRole(
				$account as unknown as string,
				res.data.requestsByAccount
			); // duplicate transactions where account debitor and creditor

			requestsByAccount = requestsPerRole.sort((a: App.ITransaction, b: App.ITransaction) => {
				if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
					return 1;
				}
				return -1;
			});
			requestsPending.set(requestsByAccount);
			return requestsByAccount;
		}
	}

	let isActive: boolean = true;
</script>

<Nav>
	{#snippet children()}
		<div class="switch">
			<SwitchButtons bind:switchButtons={isActive} dataId="activeRejectedBtns">
				{#snippet left()}
					Rejected
				{/snippet}
				{#snippet right()}
					Active
				{/snippet}
			</SwitchButtons>
		</div>
		{#await getRequestsByAccount() then requestsByAccount}
			<div class="requests">
				<div class="container">
					{#each requestsByAccount as req, i}
						{#if isActive}
							{#if !isRejected(req['transaction_items'])}
								<a href={'/requests/' + req['id']}>
									<div class="container" data-id-index={i} data-id-req={req['id']}>
										<RequestCard
											contraAccount={getTransContraAccount($account, req)}
											isCurrentAccountAuthor={req['author'] == $account}
											isCurrentAccountCreditor={isCreditor($account, req['transaction_items'])}
											requestTime={requestTime(req['transaction_items'])}
											sumValue={req['sum_value']}
										/>
									</div>
								</a>
							{/if}
						{:else if isRejected(req['transaction_items'])}
							<a href={'/requests/' + req['id']}>
								<div class="container" data-id-index={i} data-id-req={req['id']}>
									<RequestCard
										contraAccount={$account == req['author'] ? $account : req['author']}
										isCurrentAccountAuthor={req['author'] == $account}
										isCurrentAccountCreditor={isCreditor($account, req['transaction_items'])}
										requestTime={requestTime(req['transaction_items'])}
										sumValue={req['sum_value']}
									/>
								</div>
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{:catch error}
			<p>{error.message}</p>
		{/await}
	{/snippet}
</Nav>

<style>
	.switch {
		padding: 0;
		border: 0;
		margin: 2rem 0 0 0;
	}

	.requests {
		padding: 0;
		border: 0;
		margin: 1.5rem 0 0 0;
	}

	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
	}
</style>
