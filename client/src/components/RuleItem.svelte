<script lang="ts">
	import Indicator from '../components/Indicator.svelte';
	interface Props {
		index: number;
		nameValue: string;
		priceValue: string;
		quantityValue: string;
		hasError?: boolean;
	}
	let { index, nameValue, priceValue, quantityValue, hasError = false }: Props = $props();
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
