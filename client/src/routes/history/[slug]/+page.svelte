<script lang="ts">
	import DetailHeader from '../../../components/DetailHeader.svelte';
	import Button from '../../../components/Button.svelte';
	import Card from '../../../components/Card.svelte';
	import Icon from '../../../icons/Icon.svelte';
	import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
	import TRANSACTION_BY_ID_QUERY from '../../../graphql/query/transactionByID';
	import {
		requestTime,
		isCreditor,
		getTransContraAccount,
		sortTrItems,
	} from '../../../utils/transactions';
	import { fromNow } from '../../../utils/date';
	import DisputeIcon from '../../../icons/DisputeIcon.svelte';
	import { account as currentAccount } from '../../../stores/account';
	import Nav from '../../../components/Nav.svelte';
	import { page } from '$app/stores';
	import client from '../../../graphql/client';
	import { account } from '../../../stores/account';

	let transactionID = $page.params.slug;

	async function getTransactionByID(): Promise<App.ITransaction> {
		const variables = {
			id: transactionID,
			account_name: $account,
			auth_account: $account
		};

		const res = await client.query(TRANSACTION_BY_ID_QUERY, variables).toPromise();

		if (!res.data || !res.data.transactionByID) {
			return {} as App.ITransaction;
		} else {
			sortTrItems(res.data.transactionByID.transaction_items);
			return res.data.transactionByID;
		}
	}
</script>

<Nav>
	{#snippet children()}
		<div class="container">
			<DetailHeader>
				{#snippet left()}
					<span data-id="backBtn">
						<a href={$page.url.pathname.substring(0, $page.url.pathname.lastIndexOf('/'))}>
							<Icon addedStyle="" iconName={faArrowLeft} dataIDValue="backBtn" />
						</a>
					</span>
				{/snippet}
				{#snippet middle()}
					<span> History </span>
				{/snippet}
				{#snippet right()}
					<span> <Icon addedStyle="" iconName={faEnvelope} dataIDValue="emailCopyBtn" /></span>
				{/snippet}
			</DetailHeader>
		</div>
		{#await getTransactionByID() then transaction}
			<div
				data-id="contraAccount"
				data-id-contra-account={getTransContraAccount($account, transaction)}
				class="container"
			>
				<Card minHeight="2rem">
					{#snippet children()}
						<strong>{getTransContraAccount($account, transaction)}</strong>
					{/snippet}
				</Card>
			</div>
			<div data-id="sumValue" class="container">
				<Card minHeight="2rem">
					{#snippet children()}
						<strong
							>{isCreditor($currentAccount, transaction.transaction_items)
								? ''
								: '-'}{transaction.sum_value}</strong
						>
					{/snippet}
				</Card>
			</div>
			<div data-id="transactionTime" class="container">
				<Card>
					{#snippet children()}
						<small>
							<p class="time-title">
								<strong> Equilibrium time </strong>
							</p>
						</small>
						<span class="time-content">
							{fromNow(requestTime(transaction.transaction_items))}
						</span>
					{/snippet}
				</Card>
			</div>
			<hr />
			<div class="container">
				{#each transaction.transaction_items as trItem, i}
					<div data-id="transaction-item" data-id-index={i} class="container">
						<Card>
							{#snippet children()}
								<p class="transaction-item-title">
									{trItem.item_id}
								</p>
								<p class="quantity-price">
									<span class="transaction-item-quantity">{trItem.quantity}</span> x
									<span class="transaction-item-price">{trItem.price}</span>
								</p>
							{/snippet}
						</Card>
					</div>
				{/each}
			</div>
			<hr />
			<div class="container">
				<Card>
					{#snippet children()}
						<div style="clear: both;">
							<p class="left zeros">Transaction ID</p>
							<p class="right zeros">
								{transaction.id}
							</p>
						</div>
					{/snippet}
				</Card>
			</div>
			<div class="btn-group">
				<Button disabled={false} class="dispute-btn">
					{#snippet children()}
						<DisputeIcon
							style="transform: translate(-6px, 4px)
;"
						/><span class="dispute-btn-text"> Dispute</span>
					{/snippet}
				</Button>
			</div>
		{:catch error}
			<p>{error.message}</p>
		{/await}
	{/snippet}
</Nav>

<style>
	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
		color: rgb(129, 125, 125);
	}
	hr {
		margin: 1rem 0 1rem 0;
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
	.btn-group :global(.dispute-btn) {
		background-color: rgb(0, 83, 150);
		height: 3rem;
	}
	.dispute-btn-text {
		line-height: 2rem;
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
</style>
