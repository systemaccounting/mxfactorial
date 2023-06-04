<script lang="ts">
	import MobileLayout from '../containers/MobileLayout.svelte';
	import client from '../graphql/client';
	import c from '../utils/constants'
	import { setContext } from 'svelte';
	setContext(c.CLIENT_CTX_KEY, client);
</script>

<MobileLayout>
	<slot />
</MobileLayout>
