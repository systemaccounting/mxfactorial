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
		getContraAccount
	} from '../../../utils/transactions';
	import { fromNow } from '../../../utils/date';
	import { account as currentAccount } from '../../../stores/account';
	import APPROVE_REQUEST_MUTATION from '../../../mutation/approveRequest';
	import { Pulse } from 'svelte-loading-spinners';
	import { page } from '$app/stores';
	import type { Client } from '@urql/core';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';

	let client: Client = getContext('client');
	let showLoading = false;
	let requestsByAccount = $page.data.requestsByAccount;
	let transactionId = $page.params.slug;
	let request = requestsByAccount.filter((r: App.ITransaction) => r.id == transactionId)[0]; // todo: handle error;
	let rulesLastTrItems = request.transaction_items.sort((a: App.ITransactionItem) => {
		// show rule generated transaction items last
		if (a.rule_instance_id == null) {
			return -1;
		}
		return 0;
	});

	function handleApproveClick() {
		let queryVars = {
			auth_account: $currentAccount,
			id: $page.params.slug,
			account_name: $currentAccount,
			account_role: isCreditor($currentAccount, rulesLastTrItems) ? 'creditor' : 'debitor'
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
		<div
			data-id="requestContraAccount"
			data-id-request-contra-account={getContraAccount($currentAccount, request)}
			class="container"
			on:click={() => console.log(request)}
		>
			<Card minHeight="2rem">
				<strong>{getContraAccount($currentAccount, request)}</strong>
			</Card>
		</div>
		<div data-id="sumValue" class="container">
			<Card minHeight="2rem">
				<strong
					>{isCreditor($currentAccount, rulesLastTrItems) ? '' : '-'}{request.sum_value}</strong
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
					{fromNow(requestTime(rulesLastTrItems))}
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
					{expirationTime(rulesLastTrItems).toString() == new Date(0).toString()
						? 'none'
						: fromNow(expirationTime(rulesLastTrItems))}
				</span>
			</Card>
		</div>
		<div class="btn-group">
			{#if isRequestPending($currentAccount, request)}
				<Button disabled={true} class="pending-btn">Pending</Button>
			{:else}
				<span on:click={handleApproveClick} data-id="approve-btn">
					<Button disabled={false} class="approve-btn">Approve</Button>
				</span>
				<Button disabled={false} class="reject-btn">Reject</Button>
			{/if}
		</div>
		{#if !showLoading}
			<div class="transaction-items">
				{#each rulesLastTrItems as trItem, i}
					<div data-id="transaction-item" data-id-index={i} class="container">
						<Card>
							<p class="transaction-item-title">
								{trItem.item_id}
							</p>
							{trItem.quantity} x {trItem.price}
						</Card>
					</div>
				{/each}
			</div>
			<div class="container">
				<Card titleFontSize="0.8rem">
					<div style="clear: both;">
						<p class="left zeros">Transaction ID</p>
						<p class="right zeros">
							{request.id}
						</p>
					</div>
				</Card>
			</div>
		{:else}
			<div class="loading">
				<Pulse color="#fff" />
			</div>
		{/if}
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
