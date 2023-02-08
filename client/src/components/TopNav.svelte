<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '../icons/Icon.svelte';
	import { faHome, faFlag } from '@fortawesome/free-solid-svg-icons';
	import request from '../stores/request';

	function handleNavigation() {
		if ($page.url.pathname == '/account') {
			request.reset();
		}
		goto('/account');
	}
</script>

<div data-id="topNav">
	<span on:click={handleNavigation} data-id="homeIcon">
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
