<script lang="ts">
	import Card from './Card.svelte';
	import { fromNow } from '../utils/date';
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
			{isCurrentAccountCreditor ? '' : '-'}{sumValue}
		</strong>
	</p>
</Card>

<style>
	p {
		margin: 0;
		padding: 0;
		border: 0;
		text-align: right;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: var(--text-raised);
	}
	.title {
		margin: 0 0 0.3rem 0.3rem;
		text-align: left;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
	}
	.content {
		text-align: right;
	}
</style>
