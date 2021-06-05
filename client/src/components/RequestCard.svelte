<script lang="ts">
	import Card from "./Card.svelte";
	import { fromNow } from "../utils/date";
	export let contraAccount: string;
	export let isCurrentAccountAuthor: boolean;
	export let isCurrentAccountCreditor: boolean;
	export let requestTime: Date;
	export let sumValue: string;
</script>

<div>
	<Card>
		<small>
			{#if isCurrentAccountAuthor}
				<strong>{contraAccount}</strong> request sent
			{:else}
				<strong>{contraAccount}</strong> request received
			{/if}
			{fromNow(requestTime)}
		</small>
		<p>
			<strong>
				{isCurrentAccountCreditor ? "" : "-"}{sumValue}
			</strong>
		</p>
	</Card>
</div>

<style>
	div {
		margin: 0;
		border: 0;
		padding: 0;
		color: rgb(129, 125, 125);
	}
	p {
		margin: 0.5rem 0.5rem 0.3rem 0;
		border: 0;
		text-align: right;
		font-weight: medium;
	}
	small {
		padding: 0.3rem 0.3rem 0 0.3rem;
		font-size: smaller;
		text-align: left;
	}
</style>
