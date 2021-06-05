<script lang="ts">
	import Info from "../components/Info.svelte";
	import Balance from "../components/Balance.svelte";
	import Input from "../components/Input.svelte";
	import SwitchButtons from "../components/SwitchButtons.svelte";
	import TransactionItem from "../components/TransactionItem.svelte";
	import RulesUrql from "../containers/RulesUrql.svelte";
	import RuleItem from "../components/RuleItem.svelte";
	import type { ITransactionItem } from "../main.d";
	import Button from "../components/Button.svelte";
	import AddIcon from "../icons/AddIcon.svelte";
	import SubtractIcon from "../icons/SubtractIcon.svelte";
	import {
		sum,
		disableButton,
		accountValuesPresent,
		filterUserAddedItems,
	} from "../utils/transactions";

	import request from "../stores/request";
	import { account as currentAccount } from "../stores/account";
	import { getClient } from "@urql/svelte";
	import CREATE_REQUEST_MUTATION from "../mutation/createRequest";
	import { Pulse } from "svelte-loading-spinners";

	const client = getClient();
	let reqItems: ITransactionItem[];
	let rulesEventCount: number = 0;
	let trItemHeight: number;
	let prevReqItemsCount: number = 0;
	let recipient: string = "";
	let showLoading: boolean = false;

	request.subscribe(function (requestItems: ITransactionItem[]): void {
		// console.log(requestItems);
		reqItems = requestItems;
	});

	function handleAddClick() {
		request.addRequestItem();
	}

	function handleRemoveClick(e: CustomEvent): void {
		let indexToRemove: number = e.detail;
		request.removeRequestItem(indexToRemove);
	}

	function handleAutoScroll(requestItems: ITransactionItem[]) {
		let userAdded = filterUserAddedItems(requestItems);
		if (userAdded.length > prevReqItemsCount) {
			window.scrollBy(0, trItemHeight);
			prevReqItemsCount = userAdded.length;
		}
	}

	function handleChangeRecipient(e: CustomEvent) {
		if (isCredit) {
			request.addRecipient(e.detail.value, $currentAccount);
		} else {
			request.addRecipient($currentAccount, e.detail.value);
		}
	}

	function resetRecipient(requestItems: ITransactionItem[]) {
		let single = requestItems.length == 1;
		let propCount = Object.keys(requestItems[0]).length;
		let nullCount = Object.values(requestItems[0]).filter(
			(x) => x == null
		).length;
		if (single && propCount == nullCount) {
			recipient = "";
		}
	}

	function handleRequestClick() {
		if (!disableButton(reqItems) && accountValuesPresent(reqItems)) {
			client
				.mutation(CREATE_REQUEST_MUTATION, {
					auth_account: $currentAccount,
					transaction_items: reqItems,
				})
				.toPromise()
				.then((result) => {
					request.reset();
					showLoading = false;
					console.log("sent");
				})
				.catch((err) => {
					showLoading = false;
					console.log(err.message);
				});
			showLoading = true;
		}
	}

	let disableAddItem: boolean = false;
	let sumValue: string;
	let isCredit: boolean = true;

	$: sumValue = sum(reqItems);
	$: disableAddItem = disableButton(reqItems);
	$: !disableAddItem && rulesEventCount++; // count when add button enabled
	$: handleAutoScroll(reqItems);
	$: resetRecipient(reqItems);
</script>

<div>
	<div class="container" on:click={() => console.log(reqItems)}>
		<Balance />
	</div>
	<div data-id="switchBtns" class="switch container">
		<SwitchButtons bind:switchButtons={isCredit} dataId="dbCrBtns">
			<span slot="left">
				<SubtractIcon
					size={14}
					style="transform: translate(-1px, 3px)
			;"
				/> debit
			</span>
			<span slot="right">
				credit <AddIcon
					size={14}
					style="transform: translate(3px, 2px)
			;"
				/>
			</span>
		</SwitchButtons>
	</div>
	<div class="container">
		<Info label="total" value={sumValue} />
	</div>
	<div class="container">
		<Input
			placeholder="Recipient"
			hasError={false}
			bind:value={recipient}
			insertId="recipient"
			on:insert={handleChangeRecipient}
			disabled={showLoading}
		/>
	</div>
	{#if !showLoading}
		<div data-id="transactionItems" class="transaction-items">
			{#each reqItems as item, i}
				{#if item.rule_instance_id == null || item.rule_instance_id.length == 0}
					<div
						data-id="transactionItem"
						data-id-index={i}
						class="container"
						bind:clientHeight={trItemHeight}
					>
						<TransactionItem
							nameValue={item.item_id}
							priceValue={item.price}
							quantityValue={item.quantity}
							index={i}
							on:index={handleRemoveClick}
						/>
					</div>
				{/if}
			{/each}
		</div>
		<div class="container">
			<span class="add-btn" on:click={handleAddClick}>
				<Button
					disabled={disableAddItem}
					class="btn-height {disableAddItem
						? 'disable-add-btn'
						: 'enable-add-btn'}"
					><AddIcon
						size={14}
						style="transform: translate(3px, 2px);"
					/> Item</Button
				>
			</span>
			<span on:click={handleRequestClick}>
				<Button
					disabled={false}
					class="btn-height  {isCredit ? 'request-btn' : 'pay-btn'}"
					>{isCredit ? "Request" : "Pay"}
				</Button>
			</span>
		</div>

		{#if rulesEventCount > 0}
			<div data-id="ruleItems" class="container">
				<RulesUrql />
				{#each reqItems as item, i}
					{#if item.rule_instance_id && item.rule_instance_id.length > 0}
						<div
							data-id="ruleItem"
							data-id-index={i}
							class="container"
						>
							<RuleItem
								nameValue={item.item_id}
								priceValue={item.price}
								quantityValue={item.quantity}
								index={i}
							/>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{:else}
		<div class="loading">
			<Pulse color="#fff" />
		</div>
	{/if}
</div>

<style>
	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
	}

	.container :global(.btn-height) {
		height: 2.25rem;
	}

	.container :global(.disable-add-btn) {
		background-color: #00529675;
	}

	.container :global(.enable-add-btn) {
		background-color: #005396;
	}

	.container :global(.pay-btn) {
		background-color: rgb(161, 115, 175);
	}

	.container :global(.request-btn) {
		background-color: rgb(124, 185, 124);
	}

	.loading {
		padding: 0;
		border: 0;
		margin: 4rem 0 0 0;
		display: flex;
		justify-content: center;
	}
</style>
