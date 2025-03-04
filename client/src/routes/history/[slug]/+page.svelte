<script lang="ts">
	import DetailHeader from '../../../components/DetailHeader.svelte';
	import Button from '../../../components/Button.svelte';
	import Card from '../../../components/Card.svelte';
	import Icon from '../../../icons/Icon.svelte';
	import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
	import { requestTime, isCreditor, getTransContraAccount } from '../../../utils/transactions';
	import { fromNow } from '../../../utils/date';
	import DisputeIcon from '../../../icons/DisputeIcon.svelte';
	import Nav from '../../../components/Nav.svelte';
	import { page } from '$app/state';
</script>

<Nav>
	{#snippet children()}
		<div class="container">
			<DetailHeader>
				{#snippet left()}
					<span data-id="backBtn">
						<a href={page.url.pathname.substring(0, page.url.pathname.lastIndexOf('/'))}>
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
		<div
			data-id="contraAccount"
			data-id-contra-account={getTransContraAccount(page.data.account, page.data.transaction)}
			class="container"
		>
			<Card minHeight="2rem">
				{#snippet children()}
					<strong>{getTransContraAccount(page.data.account, page.data.transaction)}</strong>
				{/snippet}
			</Card>
		</div>
		<div data-id="sumValue" class="container">
			<Card minHeight="2rem">
				{#snippet children()}
					<strong
						>{isCreditor(page.data.account, page.data.transaction.transaction_items)
							? ''
							: '-'}{page.data.transaction.sum_value}</strong
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
						{fromNow(requestTime(page.data.transaction.transaction_items))}
					</span>
				{/snippet}
			</Card>
		</div>
		<hr />
		<div class="container">
			{#each page.data.transaction.transaction_items as trItem, i}
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
							{page.data.transaction.id}
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
