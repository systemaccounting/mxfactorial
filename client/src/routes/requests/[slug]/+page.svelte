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
		getTransContraAccount
	} from '../../../utils/transactions';
	import { fromNow } from '../../../utils/date';
	import { Pulse } from 'svelte-loading-spinners';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	function parentPath() {
		const path = page.url.pathname;
		// @ts-expect-error: substring returns string, not a typed route
		return resolve(path.substring(0, path.lastIndexOf('/')));
	}
	const backHref = $derived(parentPath());
	let showLoading = false;
	function submit() {
		fetch(`/requests/${page.params.slug}`, {
			method: 'POST',
			body: JSON.stringify(page.data.transaction),
			headers: {
				'content-type': 'application/json'
			}
		})
			.then((res) => {
				if (res.ok) {
					goto(resolve('/history'));
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}
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
				<span> request </span>
			{/snippet}

			{#snippet right()}
				<span> <Icon addedStyle="" iconName={faEnvelope} dataIDValue="emailCopyBtn" /></span>
			{/snippet}
		</DetailHeader>
	</div>
	<div class="container">
		<div
			data-id="requestContraAccount"
			data-id-request-contra-account={getTransContraAccount(
				page.data.account,
				page.data.transaction
			)}
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
		<div data-id="requestTime" class="container">
			<Card>
				<small>
					<p class="time-title">
						<strong> time of request </strong>
					</p>
				</small>
				<span class="time-content">
					{fromNow(requestTime(page.data.transaction.transaction_items))}
				</span>
			</Card>
		</div>
		<div data-id="expirationTime" class="container">
			<Card>
				<small>
					<p class="time-title">
						<strong> time of expiration </strong>
					</p>
				</small>
				<span class="time-content">
					{expirationTime(page.data.transaction.transaction_items).toString() ==
					new Date(0).toString()
						? 'none'
						: fromNow(expirationTime(page.data.transaction.transaction_items))}
				</span>
			</Card>
		</div>
		<div class="btn-group">
			<div class="btn-group">
				<form>
					{#if isRequestPending(page.data.account, page.data.transaction)}
						<Button disabled={true} class="pending-btn">pending</Button>
					{:else}
						<span data-id="approve-btn">
							<Button disabled={false} class="approve-btn" onclick={submit}>approve</Button>
						</span>
						<Button disabled={false} class="reject-btn">reject</Button>
					{/if}
				</form>
			</div>
		</div>
		{#if !showLoading}
			<div class="transaction-items">
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
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
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
	.btn-group :global(.approve-btn) {
		background-color: var(--color-primary);
		height: 3rem;
	}
	.btn-group :global(.reject-btn) {
		background-color: var(--color-reject);
		height: 3rem;
	}
	.btn-group :global(.pending-btn) {
		background-color: var(--color-disabled);
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
