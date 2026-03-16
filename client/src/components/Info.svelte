<script lang="ts">
	import type { Writable } from 'svelte/store';
	interface Props {
		label: string;
		value: Writable<string> | null | string;
	}
	let { label, value }: Props = $props();
</script>

<div class="info">
	<div class="label">{label}</div>
	<div class="value">{value}</div>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0;
	}
	.info {
		height: 1.5rem;
	}
	.label {
		float: left;
		font-style: italic;
		color: rgba(255, 255, 255, 0.5);
		text-shadow: var(--text-raised);
	}
	.value {
		float: right;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
	}
</style>
