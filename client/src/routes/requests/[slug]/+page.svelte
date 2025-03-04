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
					goto('/history');
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}
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
					<span> Request </span>
				{/snippet}

				{#snippet right()}
					<span> <Icon addedStyle="" iconName={faEnvelope} dataIDValue="emailCopyBtn" /></span>
				{/snippet}
			</DetailHeader>
		</div>
		<div class="container">
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div
				data-id="requestContraAccount"
				data-id-request-contra-account={getTransContraAccount(
					page.data.account,
					page.data.transaction
				)}
				class="container"
				onclick={() => console.log(page.data.transaction)}
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
			<div data-id="requestTime" class="container">
				<Card>
					{#snippet children()}
						<small>
							<p class="time-title">
								<strong> Time of request </strong>
							</p>
						</small>
						<span class="time-content">
							{fromNow(requestTime(page.data.transaction.transaction_items))}
						</span>
					{/snippet}
				</Card>
			</div>
			<div data-id="expirationTime" class="container">
				<Card>
					{#snippet children()}
						<small>
							<p class="time-title">
								<strong> Time of expiration </strong>
							</p>
						</small>
						<span class="time-content">
							{expirationTime(page.data.transaction.transaction_items).toString() ==
							new Date(0).toString()
								? 'none'
								: fromNow(expirationTime(page.data.transaction.transaction_items))}
						</span>
					{/snippet}
				</Card>
			</div>
			<div class="btn-group">
				<div class="btn-group">
					<form>
						{#if isRequestPending(page.data.account, page.data.transaction)}
							<Button disabled={true} class="pending-btn">
								{#snippet children()}
									Pending
								{/snippet}
							</Button>
						{:else}
							<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
							<span data-id="approve-btn">
								<Button disabled={false} class="approve-btn" onclick={submit}>
									{#snippet children()}
										Approve
									{/snippet}
								</Button>
							</span>
							<Button disabled={false} class="reject-btn">
								{#snippet children()}
									Reject
								{/snippet}
							</Button>
						{/if}
					</form>
				</div>
			</div>
			{#if !showLoading}
				<div class="transaction-items">
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
			{:else}
				<div class="loading">
					<Pulse color="#fff" />
				</div>
			{/if}
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
