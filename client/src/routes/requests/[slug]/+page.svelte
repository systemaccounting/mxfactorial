<script lang="ts">
	import Nav from '../../../components/Nav.svelte';
	import DetailHeader from '../../../components/DetailHeader.svelte';
	import Button from '../../../components/Button.svelte';
	import Card from '../../../components/Card.svelte';
	import Icon from '../../../icons/Icon.svelte';
	import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
	import {
		requestTime,
		expirationTime,
		isCreditor,
		isRequestPending,
		getTransContraAccount,
		sortTrItems
	} from '../../../utils/transactions';
	import REQUEST_BY_ID_QUERY from '../../../graphql/query/requestByID';
	import { fromNow } from '../../../utils/date';
	import { account as currentAccount } from '../../../stores/account';
	import APPROVE_REQUEST_MUTATION from '../../../graphql/mutation/approveRequest';
	import { Pulse } from 'svelte-loading-spinners';
	import { page } from '$app/stores';
	import type { Client } from '@urql/core';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { account } from '../../../stores/account';
	import c from '../../../utils/constants'

	let client: Client = getContext(c.CLIENT_CTX_KEY);
	let showLoading = false;
	let requestID = $page.params.slug;

	async function getRequestByID(): Promise<App.ITransaction> {
		const variables = {
			id: requestID,
			auth_account: $account
		};
		const res = await client.query(REQUEST_BY_ID_QUERY, variables).toPromise();
		if (!res.data || !res.data.requestByID) {
			return {} as App.ITransaction; // todo: support empty object in component
		} else {
			sortTrItems(res.data.requestByID.transaction_items)
			return res.data.requestByID;
		}
	}

	function handleApproveClick(request: App.ITransaction) {
		let queryVars = {
			auth_account: $currentAccount,
			id: $page.params.slug,
			account_name: $currentAccount,
			account_role: isCreditor($currentAccount, request.transaction_items) ? 'creditor' : 'debitor'
		};
		client
			.mutation(APPROVE_REQUEST_MUTATION, queryVars)
			.toPromise()
			.then((result) => {
				showLoading = false;
				goto('/history');
			})
			.catch((err) => {
				showLoading = false;
				console.log(err.message);
			});
		showLoading = true;
		return null;
	}
</script>

<Nav>
	<div class="container">
		<DetailHeader>
			<span slot="left" data-id="backBtn">
				<a href={$page.url.pathname.substring(0, $page.url.pathname.lastIndexOf('/'))}>
					<Icon addedStyle="" iconName={faArrowLeft} dataIDValue="backBtn" />
				</a>
			</span>
			<span slot="middle"> Request </span>
			<span slot="right">
				<Icon addedStyle="" iconName={faEnvelope} dataIDValue="emailCopyBtn" /></span
			>
		</DetailHeader>
	</div>
	<div class="container">
		{#await getRequestByID() then trRequest}
			<div
				data-id="requestContraAccount"
				data-id-request-contra-account={getTransContraAccount($currentAccount, trRequest)}
				class="container"
				on:click={() => console.log(trRequest)}
			>
				<Card minHeight="2rem">
					<strong>{getTransContraAccount($currentAccount, trRequest)}</strong>
				</Card>
			</div>
			<div data-id="sumValue" class="container">
				<Card minHeight="2rem">
					<strong
						>{isCreditor($currentAccount, trRequest.transaction_items)
							? ''
							: '-'}{trRequest.sum_value}</strong
					>
				</Card>
			</div>
			<div data-id="requestTime" class="container">
				<Card titleFontSize="0.8rem">
					<small>
						<p class="time-title">
							<strong> Time of request </strong>
						</p>
					</small>
					<span class="time-content">
						{fromNow(requestTime(trRequest.transaction_items))}
					</span>
				</Card>
			</div>
			<div data-id="expirationTime" class="container">
				<Card titleFontSize="0.8rem">
					<small>
						<p class="time-title">
							<strong> Time of expiration </strong>
						</p>
					</small>
					<span class="time-content">
						{expirationTime(trRequest.transaction_items).toString() == new Date(0).toString()
							? 'none'
							: fromNow(expirationTime(trRequest.transaction_items))}
					</span>
				</Card>
			</div>
			<div class="btn-group">
				{#if isRequestPending($currentAccount, trRequest)}
					<Button disabled={true} class="pending-btn">Pending</Button>
				{:else}
					<span on:click={() => handleApproveClick(trRequest)} data-id="approve-btn">
						<Button disabled={false} class="approve-btn">Approve</Button>
					</span>
					<Button disabled={false} class="reject-btn">Reject</Button>
				{/if}
			</div>
			{#if !showLoading}
				<div class="transaction-items">
					{#each trRequest.transaction_items as trItem, i}
						<div data-id="transaction-item" data-id-index={i} class="container">
							<Card>
								<p class="transaction-item-title">
									{trItem.item_id}
								</p>
								<p class="quantity-price">
									<span class="transaction-item-quantity">{trItem.quantity}</span> x
									<span class="transaction-item-price">{trItem.price}</span>
								</p>
							</Card>
						</div>
					{/each}
				</div>
				<div class="container">
					<Card titleFontSize="0.8rem">
						<div style="clear: both;">
							<p class="left zeros">Transaction ID</p>
							<p class="right zeros">
								{trRequest.id}
							</p>
						</div>
					</Card>
				</div>
			{:else}
				<div class="loading">
					<Pulse color="#fff" />
				</div>
			{/if}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</div>
</Nav>

<style>
	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
		color: rgb(129, 125, 125);
	}
	.time-title {
		font-family: sans-serif;
		margin: 0 0 0.3rem 0.3rem;
		text-align: left;
	}
	.time-content {
		text-align: right;
	}
	.btn-group {
		margin: 1rem 0 0 0;
		padding: 0;
		border: 0;
	}
	.btn-group :global(.approve-btn) {
		background-color: #005396;
		height: 3rem;
	}
	.btn-group :global(.reject-btn) {
		background-color: darkslateblue;
		height: 3rem;
	}
	.btn-group :global(.pending-btn) {
		background-color: #b3b3b3;
		height: 3rem;
	}
	.transaction-items {
		margin: 0 0 0.7rem 0;
		padding: 0;
		border: 0;
	}
	.transaction-item-title {
		margin: 0 0 0.5rem 0;
		border: 0;
		padding: 0;
		font-weight: 600;
	}
	.quantity-price {
		margin: 0 0 0 0;
		border: 0;
		padding: 0;
	}
	.left {
		float: left;
		margin: 0 0 0 0.4rem;
		font-weight: 550;
	}
	.right {
		float: right;
		margin: 0 0.4rem 0 0;
	}
	.zeros {
		border: 0;
		padding: 0;
	}
	.loading {
		padding: 0;
		border: 0;
		margin: 4rem 0 0 0;
		display: flex;
		justify-content: center;
	}
</style>
