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
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	function parentPath() {
		const path = page.url.pathname;
		// @ts-expect-error: substring returns string, not a typed route
		return resolve(path.substring(0, path.lastIndexOf('/')));
	}
	const backHref = $derived(parentPath());
</script>

<Nav>
	<div class="container">
		<DetailHeader>
			{#snippet left()}
				<span data-id="backBtn">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={backHref}>
						<Icon addedStyle="" iconName={faArrowLeft} dataIDValue="backBtn" />
					</a>
				</span>
			{/snippet}
			{#snippet middle()}
				<span> history </span>
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
			<strong>{getTransContraAccount(page.data.account, page.data.transaction)}</strong>
		</Card>
	</div>
	<div data-id="sumValue" class="container">
		<Card minHeight="2rem">
			<strong
				>{isCreditor(page.data.account, page.data.transaction.transaction_items) ? '' : '-'}{page
					.data.transaction.sum_value}</strong
			>
		</Card>
	</div>
	<div data-id="transactionTime" class="container">
		<Card>
			<small>
				<p class="time-title">
					<strong> equilibrium time </strong>
				</p>
			</small>
			<span class="time-content">
				{fromNow(requestTime(page.data.transaction.transaction_items))}
			</span>
		</Card>
	</div>
	<hr />
	<div class="container">
		{#each page.data.transaction.transaction_items as trItem, i (i)}
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
	<hr />
	<div class="container">
		<Card>
			<div style="clear: both;">
				<p class="left zeros">transaction id</p>
				<p class="right zeros">
					{page.data.transaction.id}
				</p>
			</div>
		</Card>
	</div>
	<div class="btn-group">
		<Button disabled={false} class="dispute-btn">
			<DisputeIcon
				style="transform: translate(-6px, 4px)
;"
			/><span class="dispute-btn-text"> dispute</span>
		</Button>
	</div>
</Nav>

<style>
	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
	}
	hr {
		margin: 1rem 0 1rem 0;
		border-color: rgba(255, 255, 255, 0.15);
	}
	.time-title {
		margin: 0 0 0.3rem 0.3rem;
		text-align: left;
		color: rgba(255, 255, 255, 0.6);
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
		background-color: var(--color-primary);
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
