<script lang="ts">
	import Input from './Input.svelte';
	import RemoveIcon from '../icons/RemoveIcon.svelte';
	interface Props {
		index: number;
		nameValue: string;
		priceValue: string;
		quantityValue: string;
		hasError?: boolean;
		handleRemoveClick: (idx: number) => void;
		handleChangeItem: (index: number, name: keyof App.ITransactionItem, value: string) => void;
	}
	let {
		index,
		nameValue,
		priceValue,
		quantityValue,
		hasError = false,
		handleRemoveClick,
		handleChangeItem
	}: Props = $props();

	const ITEM_NAME: keyof App.ITransactionItem = 'item_id';
	const ITEM_PRICE: keyof App.ITransactionItem = 'price';
	const ITEM_QUANTITY: keyof App.ITransactionItem = 'quantity';

	function handleName(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			handleChangeItem(index, ITEM_NAME, e.target.value);
		}
	}

	function handlePrice(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			handleChangeItem(index, ITEM_PRICE, e.target.value);
		}
	}

	function handleQuantity(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			handleChangeItem(index, ITEM_QUANTITY, e.target.value);
		}
	}
</script>

<div>
	<RemoveIcon size={10} style={null} {index} {handleRemoveClick} />
	<Input
		insertId={ITEM_NAME}
		placeholder="item"
		{hasError}
		value={nameValue}
		oninsert={handleName}
	/>
	<Input
		insertId={ITEM_PRICE}
		placeholder="price"
		{hasError}
		value={priceValue}
		oninsert={handlePrice}
	/>
	<Input
		insertId={ITEM_QUANTITY}
		placeholder="quantity"
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
