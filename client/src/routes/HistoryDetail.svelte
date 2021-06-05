<script lang="ts">
	import DetailHeader from "../components/DetailHeader.svelte";
	import Button from "../components/Button.svelte";
	import Card from "../components/Card.svelte";
	import Icon from "../icons/Icon.svelte";
	import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
	import type { ITransaction } from "../main.d";
	import { requestTime, isCreditor } from "../utils/transactions";
	import { fromNow } from "../utils/date";
	import { useNavigate } from "svelte-navigator";
	import DisputeIcon from "../icons/DisputeIcon.svelte";
	import { account as currentAccount } from "../stores/account";

	const navigate = useNavigate();

	export let transaction: ITransaction;
</script>

<DetailHeader>
	<span slot="left" data-id="backBtn" on:click={() => navigate(-1)}>
		<Icon addedStyle="" iconName={faArrowLeft} dataIDValue="backBtn" />
	</span>
	<span slot="middle"> History </span>
	<span slot="right">
		<Icon
			addedStyle=""
			iconName={faEnvelope}
			dataIDValue="emailCopyBtn"
		/></span
	>
</DetailHeader>
<div
	data-id="transactionAuthor"
	data-id-req-author={transaction.author}
	class="container"
>
	<Card minHeight="2rem">
		<strong>{transaction.author}</strong>
	</Card>
</div>
<div data-id="sumValue" class="container">
	<Card minHeight="2rem">
		<strong
			>{isCreditor($currentAccount, transaction.transaction_items)
				? ""
				: "-"}{transaction.sum_value}</strong
		>
	</Card>
</div>
<div data-id="transactionTime" class="container">
	<Card titleFontSize="0.8rem">
		<small>
			<p class="time-title">
				<strong> Equilibrium time </strong>
			</p>
		</small>
		<span class="time-content">
			{fromNow(requestTime(transaction.transaction_items))}
		</span>
	</Card>
</div>
<hr />
<div class="container">
	{#each transaction.transaction_items.sort((a) => {
		// show rule generated transaction items last
		if (a.rule_instance_id == null) {
			return -1;
		}
	}) as trItem, i}
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
<hr />
<div class="container">
	<Card titleFontSize="0.8rem">
		<div style="clear: both;">
			<p class="left zeros">Transaction ID</p>
			<p class="right zeros">
				{transaction.id}
			</p>
		</div>
	</Card>
</div>
<div class="btn-group">
	<Button disabled={false} class="dispute-btn">
		<DisputeIcon
			style="transform: translate(-6px, 4px)
;"
		/><span class="dispute-btn-text"> Dispute</span>
	</Button>
</div>

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
