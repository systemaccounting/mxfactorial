<script lang="ts">
	import Fa from "svelte-fa";
	import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
	export let iconName: IconDefinition;
	export let addedStyle: string;
	export let dataIDValue: string;

	const max: number = 1.0;
	const min: number = 0.7;

	let opacity: number = min;

	function enter(): void {
		opacity = max;
	}

	function leave(): void {
		opacity = min;
	}
</script>

<span on:mouseenter={enter} on:mouseleave={leave} data-id={dataIDValue}>
	<Fa
		size="lg"
		color="#fff"
		style="{addedStyle} opacity: {opacity};"
		icon={iconName}
	/>
</span>
