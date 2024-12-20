<script lang="ts">
	import Card from './Card.svelte';
	import { fromNow } from '../utils/date';
	interface Props {
		contraAccount: string | null;
		isCurrentAccountAuthor: boolean;
		isCurrentAccountCreditor: boolean;
		requestTime: Date;
		sumValue: string;
	}
	let {
		contraAccount,
		isCurrentAccountAuthor,
		isCurrentAccountCreditor,
		requestTime,
		sumValue
	}: Props = $props();
</script>

<div>
	<Card>
		{#snippet children()}
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
					{isCurrentAccountCreditor ? '' : '-'}{sumValue}
				</strong>
			</p>
		{/snippet}
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
