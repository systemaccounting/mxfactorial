<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import Balance from '../../components/Balance.svelte';
	import SwitchButtons from '../../components/SwitchButtons.svelte';
	import RequestCard from '../../components/RequestCard.svelte';
	import {
		isCreditor,
		isRejected,
		requestTime,
		getTransContraAccount
	} from '../../utils/transactions';
	import { page } from '$app/state';
	let isActive: boolean = true;
</script>

<Nav>
	{#snippet children()}
		<Balance />
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
		<div class="requests">
			<div class="container">
				{#each page.data.transactions as req, i}
					{#if isActive}
						{#if !isRejected(req['transaction_items'])}
							<a href={'/requests/' + req['id']}>
								<div class="container" data-id-index={i} data-id-req={req['id']}>
									<RequestCard
										contraAccount={getTransContraAccount(page.data.account, req)}
										isCurrentAccountAuthor={req['author'] == page.data.account}
										isCurrentAccountCreditor={isCreditor(
											page.data.account,
											req['transaction_items']
										)}
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
									contraAccount={page.data.account == req['author']
										? page.data.account
										: req['author']}
									isCurrentAccountAuthor={req['author'] == page.data.account}
									isCurrentAccountCreditor={isCreditor(
										page.data.account,
										req['transaction_items']
									)}
									requestTime={requestTime(req['transaction_items'])}
									sumValue={req['sum_value']}
								/>
							</div>
						</a>
					{/if}
				{/each}
			</div>
		</div>
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
