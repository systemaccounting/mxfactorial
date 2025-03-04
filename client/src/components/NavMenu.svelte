<script lang="ts">
	import { goto } from '$app/navigation';
	import { switchActiveNav } from '../stores/activeNav';
	import { signOut } from '../auth/cognito';
	import { page } from '$app/state';

	function handleDisplayClick() {
		switchActiveNav();
	}

	function handleSignOutClick(e: Event) {
		e.preventDefault();
		try {
			signOut(page.data.poolId, page.data.clientId, document.location.hostname);
		} catch (err) {
			alert(err);
		}
		goto('/');
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div onclick={handleDisplayClick}>
	<ul data-id="nav-menu">
		<a href="/requests">
			<li data-id="nav-menu-item">Requests</li>
		</a>
		<a href="/history">
			<li data-id="nav-menu-item">History</li>
		</a>
		<li data-id="nav-menu-item">Rules</li>
		<li data-id="nav-menu-item">Query</li>
		<li data-id="nav-menu-item">Support</li>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<li data-name="sign-out" data-id="nav-menu-item" onclick={handleSignOutClick}>Sign Out</li>
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
		padding: 0.5rem;
		margin: 0.3rem 0 0 0;
		font-size: 1.2rem;
		color: rgb(115, 162, 194);
		background-color: white;
		border-style: solid;
		border-width: 0.5px;
		border-radius: 3px;
		border-color: rgb(236, 236, 240);
		text-align: right;
		box-shadow: -7px 7px 9px 1px rgba(92, 92, 95, 0.3);
		cursor: pointer;
	}
</style>
