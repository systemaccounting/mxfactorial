<script lang="ts">
	import Fa from "svelte-fa";
	import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
	interface Props {
		iconName: IconDefinition;
		addedStyle: string;
		dataIDValue: string;
	}

	let { iconName, addedStyle, dataIDValue }: Props = $props();

	const max: number = 1.0;
	const min: number = 0.7;

	let opacity = $state(min);

	function enter(): void {
		opacity = max;
	}

	function leave(): void {
		opacity = min;
	}
</script>

<span role="presentation" onmouseenter={enter} onmouseleave={leave} data-id={dataIDValue}>
	<Fa
		size="lg"
		color="#fff"
		style="{addedStyle} opacity: {opacity};"
		icon={iconName}
	/>
</span>
