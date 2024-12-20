<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '../icons/Icon.svelte';
	import { faHome, faFlag } from '@fortawesome/free-solid-svg-icons';
	import { reset } from '../stores/requestCreate';

	function handleNavigation() {
		if ($page.url.pathname == '/account') {
			reset();
		}
		goto('/account');
	}
</script>

<div data-id="topNav">
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<span onclick={handleNavigation} data-id="homeIcon">
		<Icon addedStyle="float: left;" iconName={faHome} dataIDValue="" />
	</span>
	<Icon addedStyle="width: 2.5rem;" iconName={faFlag} dataIDValue="notificationIcon" />
</div>

<style>
	div {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: left;
		color: #efefef;
		margin: 0 0 1rem 0;
		border: 0;
		padding: 0;
	}
</style>
