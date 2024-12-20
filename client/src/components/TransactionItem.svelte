<script lang="ts">
	import Input from './Input.svelte';
	import RemoveIcon from '../icons/RemoveIcon.svelte';
	import { changeRequestItem } from '../stores/requestCreate';
	interface Props {
		index: number;
		nameValue: string;
		priceValue: string;
		quantityValue: string;
		hasError?: boolean;
		handleRemoveClick: (idx: number) => void;
	}
	let { index, nameValue, priceValue, quantityValue, hasError = false, handleRemoveClick }: Props = $props();

	const ITEM_NAME: keyof App.ITransactionItem = 'item_id';

	const ITEM_PRICE: keyof App.ITransactionItem = 'price';

	const ITEM_QUANTITY: keyof App.ITransactionItem = 'quantity';

	function handleName(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			changeRequestItem(index, ITEM_NAME, e.target.value);
		}
	}

	function handlePrice(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			changeRequestItem(index, ITEM_PRICE, e.target.value);
		}
	}

	function handleQuantity(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			changeRequestItem(index, ITEM_QUANTITY, e.target.value);
		}
	}
</script>

<div>
	<RemoveIcon size={10} style={null} {index} {handleRemoveClick} />
	<Input
		insertId={ITEM_NAME}
		placeholder="Item"
		{hasError}
		value={nameValue}
		oninsert={handleName}
	/>
	<Input
		insertId={ITEM_PRICE}
		placeholder="Price"
		{hasError}
		value={priceValue}
		oninsert={handlePrice}
	/>
	<Input
		insertId={ITEM_QUANTITY}
		placeholder="Quantity"
		{hasError}
		value={quantityValue}
		oninsert={handleQuantity}
	/>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0;
	}
</style>
