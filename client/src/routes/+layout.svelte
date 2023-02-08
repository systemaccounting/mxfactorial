<script lang="ts">
	import MobileLayout from '../containers/MobileLayout.svelte';
	import client from '../client/graphql';
	import { setContext } from 'svelte';
	setContext('client', client);
</script>

<MobileLayout>
	<slot />
</MobileLayout>
