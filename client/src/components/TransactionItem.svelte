<script lang="ts">
	import Input from "./Input.svelte";
	import RemoveIcon from "../icons/RemoveIcon.svelte";
	import request from "../stores/request";
	export let index: number;
	export let nameValue: string;
	export let priceValue: string;
	export let quantityValue: string;
	let hasError: boolean;

	const ITEM_NAME: string = "item_id";

	const ITEM_PRICE: string = "price";

	const ITEM_QUANTITY: string = "quantity";

	function handleName(e: CustomEvent) {
		request.changeRequestItem(index, ITEM_NAME, e.detail.value);
	}

	function handlePrice(e: CustomEvent) {
		request.changeRequestItem(index, ITEM_PRICE, e.detail.value);
	}

	function handleQuantity(e: CustomEvent) {
		request.changeRequestItem(index, ITEM_QUANTITY, e.detail.value);
	}
</script>

<div>
	<RemoveIcon size={10} style={null} {index} on:index />
	<Input
		insertId={ITEM_NAME}
		placeholder="Item"
		{hasError}
		value={nameValue}
		on:insert={handleName}
	/>
	<Input
		insertId={ITEM_PRICE}
		placeholder="Price"
		{hasError}
		value={priceValue}
		on:insert={handlePrice}
	/>
	<Input
		insertId={ITEM_QUANTITY}
		placeholder="Quantity"
		{hasError}
		value={quantityValue}
		on:insert={handleQuantity}
	/>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0;
	}
</style>
