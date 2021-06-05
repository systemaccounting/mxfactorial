<script lang="ts">
	export let label: string;
	export let value: string;
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
		color: rgba(255, 255, 255, 0.6);
	}
	.value {
		float: right;
		color: rgb(255, 246, 113);
		text-shadow: 0.7px 0.7px rgba(92, 92, 95, 0.2);
	}
</style>
