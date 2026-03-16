<script lang="ts">
	import Nav from '../../components/Nav.svelte';
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
		emptyItem,
		addItem,
		removeItem,
		changeItem,
		addRecipient,
		switchRecipient,
		getRecipient
	} from '../../utils/transactions/requestCreate';
	import { page } from '$app/state';
	import { Pulse } from 'svelte-loading-spinners';
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { createClient } from '../../graphql/client';
	import { createRulesService } from '../../services/rules';
	import { createRequestService } from '../../services/request';

	const account = page.data.account;
	const client = createClient(
		env.PUBLIC_GRAPHQL_URI,
		env.PUBLIC_GRAPHQL_RESOURCE,
		page.data.idToken
	);

	let items = $state([emptyItem()]);

	function setItems(newItems: App.ITransactionItem[]) {
		items = newItems;
	}

	const rulesService = createRulesService(client, account, setItems);
	const requestService = createRequestService(client, account, setItems);

	let trItemHeight = $state(0);
	let prevReqItemsCount = 0;
	let initialRecipient = getRecipient([emptyItem()], account);
	let recipient = $state(initialRecipient ? initialRecipient : '');
	let showLoading = $state(false);
	let rulesEventCount = $state(0);
	let sumValue = $state('0.000');
	let isCredit = $state(true);
	let disableAddItem = $state(true);

	$effect(() => {
		sumValue = sum(items);
		disableAddItem = disableButton(items);
		handleAutoScroll(items);
		resetRecipient(items);
		if (!disableAddItem && accountsAvailable(items)) {
			untrack(() => {
				rulesEventCount++;
				rulesService.onItemsChanged(items, isCredit);
			});
		}
	});

	function handleAddClick() {
		items = addItem(items);
	}

	function handleRemoveClick(idx: number): void {
		items = removeItem(items, idx);
	}

	function handleChangeItem(index: number, name: keyof App.ITransactionItem, value: string) {
		items = changeItem(items, index, name, value);
	}

	function handleSwitch() {
		items = switchRecipient(items);
	}

	function handleReset() {
		items = [emptyItem()];
		recipient = '';
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
				items = addRecipient(items, e.target.value, account);
			} else {
				items = addRecipient(items, account, e.target.value);
			}
		}
	}

	function resetRecipient(requestItems: App.ITransactionItem[]) {
		let single = requestItems.length == 1;
		let allNull = Object.values(requestItems[0]).every((x) => x === null);
		if (single && allNull) {
			recipient = '';
		}
	}

	function handleRequestClick() {
		if (!disableButton(items) && accountsAvailable(items)) {
			requestService.submit(isCredit, sumValue, items, {
				onStart: () => {
					showLoading = true;
				},
				onEnd: () => {
					showLoading = false;
				},
				onSuccess: () => {
					goto(resolve('/requests'));
				}
			});
		}
	}
</script>

<Nav onreset={handleReset}>
	<div class="container">
		<Balance />
	</div>
	<div data-id="switchBtns" class="switch container">
		<SwitchButtons bind:switchButtons={isCredit} dataId="dbCrBtns" onswitch={handleSwitch}>
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
		<div class="total-well">
			<span class="total-label">total</span>
			<span class="total-value">{sumValue}</span>
		</div>
	</div>
	<div class="container">
		<Input
			placeholder="recipient"
			hasError={false}
			bind:value={recipient}
			insertId="recipient"
			oninsert={handleChangeRecipient}
			disabled={showLoading}
		/>
	</div>
	{#if !showLoading}
		<div data-id="transactionItems" class="transaction-items">
			{#each items as item, i (i)}
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
							{handleChangeItem}
						/>
					</div>
				{/if}
			{/each}
		</div>
		<div class="container">
			<span class="add-btn">
				{#snippet addButton()}
					<AddIcon size={14} style="transform: translate(3px, 2px);" /> item
				{/snippet}
				<Button
					disabled={disableAddItem}
					class="btn-height {disableAddItem ? 'disable-add-btn' : 'enable-add-btn'}"
					onclick={handleAddClick}
					children={addButton}
				/>
			</span>
			<span>
				{#snippet reqPayBtn()}
					{isCredit ? 'request' : 'pay'}
				{/snippet}
				<Button
					disabled={false}
					class="btn-height  {isCredit ? 'request-btn' : 'pay-btn'}"
					onclick={handleRequestClick}
					children={reqPayBtn}
				/>
			</span>
		</div>

		{#if rulesEventCount && items.filter((r) => r.rule_instance_id).length}
			<div data-id="ruleItems" class="container">
				{#each items.filter((r) => r.rule_instance_id) as item, i (i)}
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
		background-color: rgba(40, 90, 150, 0.65);
	}

	.container :global(.enable-add-btn) {
		background-color: rgba(40, 90, 150, 0.75);
	}

	.container :global(.pay-btn) {
		background-color: rgba(100, 80, 130, 0.7);
	}

	.container :global(.request-btn) {
		background-color: rgba(80, 140, 120, 0.7);
	}

	.total-well {
		display: flex;
		align-items: baseline;
		padding: 0.4rem 0.1rem;
		filter: blur(0.5px);
	}

	.total-label {
		font-style: italic;
		color: rgba(255, 255, 255, 0.75);
		text-shadow: 0 2px 3px rgba(0, 0, 0, 0.35);
	}

	.total-value {
		margin-left: auto;
		color: rgba(255, 255, 255, 0.75);
		text-shadow: 0 2px 3px rgba(0, 0, 0, 0.35);
	}

	.loading {
		padding: 0;
		border: 0;
		margin: 4rem 0 0 0;
		display: flex;
		justify-content: center;
	}
</style>
