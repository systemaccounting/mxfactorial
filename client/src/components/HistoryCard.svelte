<script lang="ts">
	import Card from "./Card.svelte";
	import { fromNow } from "../utils/date";
	interface Props {
		contraAccount: string | null;
		isCurrentAccountCreditor: boolean;
		equilibriumTime: Date;
		sumValue: string;
	}
	let { contraAccount, isCurrentAccountCreditor, equilibriumTime, sumValue }: Props = $props();
</script>

<Card>
	<p class="title">
		<strong>{contraAccount}</strong> transaction
		{fromNow(equilibriumTime)}
	</p>
	<p class="content">
		<strong>
			{isCurrentAccountCreditor ? "" : "-"}{sumValue}
		</strong>
	</p>
</Card>

<style>
	p {
		margin: 0;
		padding: 0;
		border: 0;
		text-align: right;
		font-weight: medium;
		color: rgb(129, 125, 125);
	}
	.title {
		font-family: sans-serif;
		margin: 0 0 0.3rem 0.3rem;
		text-align: left;
		font-size: 0.85rem;
	}
	.content {
		text-align: right;
	}
</style>
