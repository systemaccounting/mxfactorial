<script lang="ts">
	import Nav from '../../components/Nav.svelte';
	import Info from '../../components/Info.svelte';
	import Balance from '../../components/Balance.svelte';
	import Input from '../../components/Input.svelte';
	import SwitchButtons from '../../components/SwitchButtons.svelte';
	import TransactionItem from '../../components/TransactionItem.svelte';
	import RuleItem from '../../components/RuleItem.svelte';
	import Button from '../../components/Button.svelte';
	import AddIcon from '../../icons/AddIcon.svelte';
	import SubtractIcon from '../../icons/SubtractIcon.svelte';
	import {
		sum,
		disableButton,
		filterUserAddedItems,
		accountsAvailable
	} from '../../utils/transactions';
	import {
		addRuleItems,
		requestCreate,
		addRequestItem,
		removeRequestItem,
		reset,
		addRecipient,
		getRecipient
	} from '../../stores/requestCreate';
	import { page } from '$app/state';
	const account = page.data.account;
	import CREATE_REQUEST_MUTATION from '../../graphql/mutation/createRequest';
	import { Pulse } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import RULES_QUERY from '../../graphql/query/rules';
	import initialJSON from '../../data/initial.json';
	import { env } from '$env/dynamic/public';
	import { createClient } from '../../graphql/client';
	if (!env.PUBLIC_GRAPHQL_URI) throw new Error('PUBLIC_GRAPHQL_URI not set');
	if (!env.PUBLIC_CLIENT_ID) throw new Error('PUBLIC_CLIENT_ID not set');

	// src/hooks.server.ts creates a global graphql client for server but
	// another graphql client is created client-side to speed up rule queries
	const client = createClient(env.PUBLIC_GRAPHQL_URI, page.data.idToken);

	const initial: App.ITransactionItem[] = JSON.parse(JSON.stringify(initialJSON));

	let trItemHeight = $state(0);
	let prevReqItemsCount = 0;

	let recipient = $state(getRecipient(account) ? getRecipient(account) : '');

	let showLoading = $state(false);
	let rulesEventCount = $state(0);
	let previouslySubmitted = ''; // used to send rules request only on diff
	const rulesRequestTimeBufferMs = 995; // 5 ms remainder added in setTimeout
	let minRequestTime = new Date().getTime() + rulesRequestTimeBufferMs;

	let sumValue = $state('0.000');
	let isCredit = $state(true);
	let reqItems = $state(initial);
	let disableAddItem = $state(true);

	$effect(() => {
		sumValue = sum(reqItems);
		handleAutoScroll(reqItems);
		resetRecipient(reqItems);
	});

	requestCreate.subscribe(function (requestItems: App.ITransactionItem[]): void {
		reqItems = requestItems;
		minRequestTime = new Date().getTime() + rulesRequestTimeBufferMs;
		disableAddItem = disableButton(reqItems);
		if (!disableAddItem && accountsAvailable(reqItems)) {
			rulesEventCount++;
			let userAdded = filterUserAddedItems(requestItems);
			if (previouslySubmitted != JSON.stringify(userAdded)) {
				setTimeout(async () => {
					if (new Date().getTime() > minRequestTime) {
						getRuleItems(userAdded);
					}
				}, rulesRequestTimeBufferMs + 5);
			}
		}
	});

	async function getRuleItems(userAdded: App.ITransactionItem[]) {
		previouslySubmitted = JSON.stringify(userAdded);
		const res = await client.query(RULES_QUERY, { transaction_items: userAdded }).toPromise();
		if (!res.data || !res.data.rules) {
			addRuleItems([]);
		} else {
			addRuleItems(res.data.rules.transaction_items);
		}
	}

	function handleAddClick() {
		addRequestItem();
	}

	function handleRemoveClick(idx: number): void {
		removeRequestItem(idx);
	}

	function handleAutoScroll(requestItems: App.ITransactionItem[]) {
		let userAdded = filterUserAddedItems(requestItems);
		if (userAdded.length > prevReqItemsCount) {
			onMount(() => {
				window.scrollBy(0, trItemHeight);
				prevReqItemsCount = userAdded.length;
			});
		}
	}

	function handleChangeRecipient(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			if (isCredit) {
				if (e.target instanceof HTMLInputElement) {
					addRecipient(e.target.value, account);
				}
			} else {
				addRecipient(account, e.target.value);
			}
		}
	}

	function resetRecipient(requestItems: App.ITransactionItem[]) {
		let single = requestItems.length == 1;
		let propCount = Object.keys(requestItems[0]).length;
		let nullCount = Object.values(requestItems[0]).filter((x) => x === null).length;
		let nonNulls = propCount - nullCount;
		if (single && nonNulls <= 2) {
			recipient = '';
		}
	}

	function handleRequestClick() {
		if (!disableButton(reqItems) && accountsAvailable(reqItems)) {
			client
				.mutation(CREATE_REQUEST_MUTATION, {
					auth_account: account,
					transaction_items: reqItems
				})
				.toPromise()
				.then((result) => {
					reset();
					showLoading = false;
					goto('/requests');
				})
				.catch((err) => {
					showLoading = false;
					console.log(err.message);
				});
			showLoading = true;
		}
	}
</script>

<Nav>
	{#snippet children()}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="container" onclick={() => console.log(reqItems)}>
			<Balance />
		</div>
		<div data-id="switchBtns" class="switch container">
			<SwitchButtons bind:switchButtons={isCredit} dataId="dbCrBtns">
				{#snippet left()}
					<span>
						<SubtractIcon size={14} style="transform: translate(-1px, 3px);" /> debit
					</span>
				{/snippet}
				{#snippet right()}
					<span>
						credit <AddIcon size={14} style="transform: translate(3px, 2px);" />
					</span>
				{/snippet}
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
				oninsert={handleChangeRecipient}
				disabled={showLoading}
			/>
		</div>
		{#if !showLoading}
			<div data-id="transactionItems" class="transaction-items">
				{#each reqItems as item, i}
					{#if !item.rule_instance_id || !item.rule_instance_id.length}
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
								{handleRemoveClick}
							/>
						</div>
					{/if}
				{/each}
			</div>
			<div class="container">
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<span class="add-btn" onclick={handleAddClick}>
					{#snippet addButton()}
						<AddIcon size={14} style="transform: translate(3px, 2px);" /> Item
					{/snippet}
					<Button
						disabled={disableAddItem}
						class="btn-height {disableAddItem ? 'disable-add-btn' : 'enable-add-btn'}"
						children={addButton}
					/>
				</span>
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<span onclick={handleRequestClick}>
					{#snippet reqPayBtn()}
						{isCredit ? 'Request' : 'Pay'}
					{/snippet}
					<Button
						disabled={false}
						class="btn-height  {isCredit ? 'request-btn' : 'pay-btn'}"
						children={reqPayBtn}
					/>
				</span>
			</div>

			{#if rulesEventCount && reqItems.filter((r) => r.rule_instance_id).length}
				<div data-id="ruleItems" class="container">
					{#each reqItems.filter((r) => r.rule_instance_id) as item, i}
						<div data-id="ruleItem" data-id-index={i} class="container">
							<RuleItem
								nameValue={item.item_id}
								priceValue={item.price}
								quantityValue={item.quantity}
								index={i}
							/>
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="loading">
				<Pulse color="#fff" />
			</div>
		{/if}
	{/snippet}
</Nav>

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
