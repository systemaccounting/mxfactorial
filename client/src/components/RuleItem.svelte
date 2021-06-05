<script lang="ts">
	import Indicator from "../components/Indicator.svelte";
	export let index: number;
	export let nameValue: string;
	export let priceValue: string;
	export let quantityValue: string;
	let hasError: boolean;
</script>

<div data-id-index={index} class="container">
	<Indicator placeholder="Item" {hasError} value={nameValue} />
	<Indicator placeholder="Price" {hasError} value={priceValue} />
	<Indicator placeholder="Quantity" {hasError} value={quantityValue} />
</div>

<style>
	.container {
		margin: 0.5rem 0 0 0;
		padding: 0;
		border: 0;
	}
</style>
