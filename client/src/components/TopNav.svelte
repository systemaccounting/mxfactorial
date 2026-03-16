<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import Icon from '../icons/Icon.svelte';
	import { faHome, faFlag } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		onreset?: () => void;
		theme?: 'surface' | 'flat';
		align?: 'left' | 'right';
	}
	let { onreset, theme = 'surface', align = 'left' }: Props = $props();

	let iconColor = $derived(theme === 'flat' ? '#333' : '#fff');

	function handleNavigation() {
		if ($page.url.pathname == '/account' && onreset) {
			onreset();
		}
		goto(resolve('/account'));
	}
</script>

<div data-id="topNav" class="{theme} {align === 'right' ? 'align-right' : ''}">
	<button onclick={handleNavigation} data-id="homeIcon" class="home-btn" aria-label="home">
		<Icon addedStyle="float: left;" iconName={faHome} dataIDValue="" color={iconColor} />
	</button>
	<button class="notification-btn" aria-label="notifications" data-id="notificationBtn">
		<Icon iconName={faFlag} dataIDValue="notificationIcon" color={iconColor} />
	</button>
</div>

<style>
	div {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: left;
		margin: 0 0 1rem 0;
		border: 0;
	}

	.surface {
		color: rgba(255, 255, 255, 0.7);
	}

	.flat {
		color: #333;
	}

	.align-right {
		justify-content: flex-end;
	}

	.home-btn {
		background: none;
		border: none;
		box-shadow: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		margin-right: 0.5rem;
	}

	.notification-btn {
		background: none;
		border: none;
		box-shadow: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
	}

	.align-right .notification-btn {
		margin-right: 0.5rem;
	}
</style>
