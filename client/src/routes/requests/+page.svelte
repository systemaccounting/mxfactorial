<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import SwitchButtons from '../../components/SwitchButtons.svelte';
	import RequestCard from '../../components/RequestCard.svelte';
	import { isCreditor, isRejected, requestTime, getContraAccount } from '../../utils/transactions';
	import { account as currentAccount } from '../../stores/account';
	import { duplicateRequestsPerRole } from '../../utils/transactions';
	import type { PageData } from './$types';

	export let data: PageData;

	let requestsByAccount: App.ITransaction[];

	if (data.requestsByAccount) {
		const requestsPerRole = duplicateRequestsPerRole(
			$currentAccount as unknown as string,
			data.requestsByAccount
		); // duplicate requests where account debitor and creditor

		requestsByAccount = requestsPerRole.sort((a: App.ITransaction, b: App.ITransaction) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		});
	}

	let isActive: boolean = true;
</script>

<Nav>
	<div class="switch">
		<SwitchButtons bind:switchButtons={isActive} dataId="activeRejectedBtns">
			<span slot="left">Rejected</span>
			<span slot="right">Active</span>
		</SwitchButtons>
	</div>
	{#if requestsByAccount}
		<div class="requests">
			<div class="container">
				{#each requestsByAccount as req, i}
					{#if isActive}
						{#if !isRejected(req['transaction_items'])}
							<a href={'/requests/' + req['id']}>
								<div class="container" data-id-index={i} data-id-req={req['id']}>
									<RequestCard
										contraAccount={getContraAccount($currentAccount, req)}
										isCurrentAccountAuthor={req['author'] == $currentAccount}
										isCurrentAccountCreditor={isCreditor($currentAccount, req['transaction_items'])}
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
									contraAccount={$currentAccount == req['author'] ? $currentAccount : req['author']}
									isCurrentAccountAuthor={req['author'] == $currentAccount}
									isCurrentAccountCreditor={isCreditor($currentAccount, req['transaction_items'])}
									requestTime={requestTime(req['transaction_items'])}
									sumValue={req['sum_value']}
								/>
							</div>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</Nav>
<slot />

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
