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
		height: 2.5rem;
		width: 100%;
		text-align: center;
		border-radius: 3px;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		background-color: rgb(255, 255, 255);
		cursor: cursor;
		margin: 0 0 0.5rem 0;
		padding: 0;
		border: 0;
	}

	.field::-webkit-input-placeholder {
		color: rgb(131, 131, 131);
	}

	.field:focus::-webkit-input-placeholder {
		color: transparent;
		outline: none;
	}

	.error {
		color: red;
	}
</style>
