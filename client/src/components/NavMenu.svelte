<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { signOut } from '../auth/cognito';
	import { page } from '$app/state';
	import TopNav from './TopNav.svelte';

	interface Props {
		toggle: () => void;
		theme?: 'surface' | 'flat';
		showTopNav?: boolean;
		topNavAlign?: 'left' | 'right';
	}
	let { toggle, theme = 'surface', showTopNav = false, topNavAlign = 'left' }: Props = $props();

	function handleDisplayClick() {
		toggle();
	}

	function handleSignOutClick(e: Event) {
		e.preventDefault();
		try {
			signOut(page.data.poolId, page.data.clientId, document.location.hostname);
		} catch (err) {
			alert(err);
		}
		goto(resolve('/'));
	}
</script>

<div onclick={handleDisplayClick} role="presentation">
	<ul data-id="nav-menu" class={theme}>
		{#if showTopNav}
			<TopNav {theme} align={topNavAlign} />
		{/if}
		<a href={resolve('/requests')}>
			<li data-id="nav-menu-item">requests</li>
		</a>
		<a href={resolve('/history')}>
			<li data-id="nav-menu-item">history</li>
		</a>
		<li data-id="nav-menu-item">rules</li>
		<a href={resolve('/measure')} data-sveltekit-reload>
			<li data-id="nav-menu-item">measure</li>
		</a>
		<li data-id="nav-menu-item">support</li>
		<li data-id="nav-menu-item" data-name="sign-out" onclick={handleSignOutClick}>sign out</li>
	</ul>
</div>

<style>
	ul {
		margin: 0.5rem 1rem 0 0;
		padding: 0;
		max-height: 100%;
		overflow-y: scroll;
		position: fixed;
		right: 0.5rem;
		bottom: 6rem;
		z-index: 100;
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-end;
		list-style-type: none;
		scrollbar-width: none;
	}

	ul::-webkit-scrollbar {
		display: none;
	}

	li {
		padding: 0.5rem 0.8rem;
		margin: 0.3rem 0 0 0;
		font-size: 1.2rem;
		border: none;
		border-radius: 0.5rem;
		text-align: right;
		cursor: pointer;
	}

	.surface li {
		color: rgba(255, 255, 255, 0.8);
		text-shadow: var(--text-raised);
		background-color: rgba(255, 255, 255, 0.08);
		box-shadow:
			inset -2px -2px 4px var(--bevel-shadow),
			inset 1px 1px 3px var(--bevel-light);
	}

	.flat {
		right: 0.5rem;
	}

	.flat li {
		color: #333;
		text-shadow: none;
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
</style>
