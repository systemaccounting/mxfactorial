<script lang="ts">
	// insertId enables any parent component to discover
	// which input component is sending an insert event
	interface Props {
		insertId: string;
		hasError: boolean;
		placeholder: string;
		value: string;
		disabled?: boolean;
		oninsert: (e: Event) => void;
	}
	let {
		insertId,
		hasError,
		placeholder,
		value = $bindable(),
		disabled = false,
		oninsert
	}: Props = $props();
</script>

<div class="container">
	<input
		data-id-insert={insertId}
		{placeholder}
		bind:value
		class="field {hasError ? 'error' : null}"
		oninput={oninsert}
		{disabled}
	/>
</div>

<style>
	.container {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
	}

	.field {
		width: 100%;
	}

	.error {
		color: var(--color-error);
	}
</style>
