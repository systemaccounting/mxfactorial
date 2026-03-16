<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { createGdpSubscription } from '../../services/gdpSubscription';
	import { createMapService, createPriceTag } from '../../services/mapService';
	import Hamburger from '../../components/Hamburger.svelte';
	import NavMenu from '../../components/NavMenu.svelte';

	let searchQuery = $state('');
	let price = $state('0.000');
	let priceTag: HTMLDivElement = $state(document.createElement('div'));
	let messageCount = $state(0);
	let isOpen = $state(false);
	function toggle() {
		isOpen = !isOpen;
	}
	function handleWindowClick() {
		if (isOpen) isOpen = false;
	}

	const hasMapKey = !!env.PUBLIC_GOOGLE_MAPS_API_KEY;
	const mapService = hasMapKey ? createMapService(env.PUBLIC_GOOGLE_MAPS_API_KEY as string) : null;
	const gdp = createGdpSubscription(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_WS_RESOURCE);

	function toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	// minimal poc:
	// 'riverside california gdp now'
	// 'StateOfCalifornia revenue now'
	// 'california gdp now'
	function parseQuery(location: string) {
		const time = new Date().toISOString().split('T')[0];
		let country = 'United States of America';
		let region = 'California';
		let locations = location.split(' ');
		let municipality = null;
		if (locations.length === 2) {
			municipality = toTitleCase(locations[0]);
		}
		return { time, country, region, municipality };
	}

	async function handleSearch(event: Event) {
		event.preventDefault();

		if (searchQuery.trim() === '') {
			await gdp.reset();
			await mapService?.reset();
			return;
		}

		let location;
		if (searchQuery.includes('gdp')) {
			location = searchQuery.split('gdp')[0].trim();
		} else {
			location = searchQuery.split('revenue')[0].trim();
		}

		// temp hack to handle 'StateOfCalifornia revenue now'
		if (location.includes('StateOfCalifornia')) {
			location = 'sacramento california';
		}

		messageCount = 0;
		priceTag = createPriceTag();
		mapService?.centerOnLocation(location, priceTag);

		const queryVars = parseQuery(location);
		await gdp.subscribe(
			queryVars.time,
			queryVars.country,
			queryVars.region,
			queryVars.municipality,
			(value) => {
				price = value;
				messageCount++;
				if (messageCount === 1) {
					setTimeout(() => {
						priceTag.style.opacity = '1';
					}, 250);
				}
			}
		);
	}

	onMount(() => {
		mapService?.init();
	});

	$effect(() => {
		if (priceTag) {
			priceTag.textContent = `${price}`;
		}
	});
</script>

<svelte:window onclick={handleWindowClick} />

<div class="search-bar-container">
	<form class="search-bar" onsubmit={handleSearch}>
		<input
			type="text"
			class="search-input"
			placeholder="Search for 'california gdp now'"
			bind:value={searchQuery}
		/>
	</form>
</div>

<div class="map-container">
	<div id="map"></div>
</div>

{#if isOpen}
	<NavMenu {toggle} theme="flat" showTopNav topNavAlign="right" />
{/if}
<Hamburger {isOpen} {toggle} theme="flat" />

<style>
	.search-bar-container {
		position: absolute;
		top: 5px; /* Adjust as needed */
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		width: 80%; /* Adjust to span 80% of the screen */
		padding: 10px;
		box-sizing: border-box;
	}

	.search-bar {
		width: 100%; /* Full width within the search bar container */
	}

	.search-input {
		width: calc(100% - 22px);
		padding: 10px;
		margin: 15px 0;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 6px;
		box-shadow: none;
		background-color: white;
		color: inherit;
		text-shadow: none;
		text-align: left;
		height: auto;
		caret-color: auto;
	}

	.map-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh; /* Full viewport height */
		padding: 20px;
		box-sizing: border-box;
	}

	#map {
		width: 80%; /* 80% width to leave 10% margin on each side */
		height: 100%; /* Full height within the container */
	}
</style>
