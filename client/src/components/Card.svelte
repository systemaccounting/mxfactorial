<script lang="ts">
	export let minHeight: string = "3rem";
</script>

<div style="min-height: {minHeight};" class={$$props.class}>
	<slot />
</div>

<style>
	div {
		border-radius: 4px;
		padding: 8px;
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		font-family: Sans-Serif;
		background-color: rgb(255, 255, 255);
	}
</style>
