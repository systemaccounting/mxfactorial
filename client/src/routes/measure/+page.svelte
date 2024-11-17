<script lang="ts">
	import { Loader } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import b64 from 'base-64';
	import { createClient as createWSClient } from 'graphql-ws';
	import type { Client } from 'graphql-ws';
	let searchQuery = '';
	let price: string;
	let priceTag: HTMLDivElement;
	let map: google.maps.Map;
	let markers = [] as any[]; // todo: google.maps.marker.AdvancedMarkerElement does not expect setMap method
	let messageCount = 0;
	let wsClient: Client;
	let stop = false;
	let defaultCoordinates = { lat: 39.8283, lng: -98.5795 }; // usa

	async function subscribeGdp(
		date: string,
		country: string,
		region: string,
		municipality: string | null
	) {

		if (messageCount) {
			await resetWebsocket();
		}

		wsClient = createWSClient({
				url: b64.decode(process.env.GRAPHQL_SUBSCRIPTIONS_URI as string),
			});

		const variables: any = { date, country, region };
		if (municipality) {
			variables.municipality = municipality;
		}

		const subscription = wsClient.iterate({
			query: `subscription QueryGdp($date: String!, $country: String, $region: String, $municipality: String) {
				queryGdp(date: $date, country: $country, region: $region, municipality: $municipality)
				}`,
			variables
		});

		for await (const { data } of subscription) {
			if (stop) {
				stop = false;
				break;
			}
			if (data && typeof data.queryGdp === 'number') {
				price = data.queryGdp.toFixed(3);
				messageCount++;
			}
		}
	}

	const loader = new Loader({
		apiKey: b64.decode(process.env.GOOGLE_MAPS_API_KEY as string),
		version: 'weekly',
		libraries: ['maps', 'marker', 'places']
	});

	async function handleSearch(event: Event) {
		event.preventDefault();

		if (searchQuery.trim() === '') {
			await resetMap();
			return;
		}

		// parse location from search query
		let location;
		if (searchQuery.includes('gdp')) {
			location = searchQuery.split('gdp')[0].trim();
		} else {
			location = searchQuery.split('revenue')[0].trim();
		}

		// temp hack to handle 'StateOfCalifornia revenue now'
		// if location contains 'StateOfCalifornia', replace with 'sacramento california'
		if (location.includes('StateOfCalifornia')) {
			location = 'sacramento california';
		}

		changeMapCenter(location);
		const queryVars = parseQuery(location);
		await subscribeGdp(queryVars.time, queryVars.country, queryVars.region, queryVars.municipality);
	}

	async function resetWebsocket() {
		stop = true;
		// wait for subscription loop to break
		while (stop) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		messageCount = 0;
	}

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
		// poc hardcoding
		const time = new Date().toISOString().split('T')[0]; // 2021-09-01
		let country = 'United States of America';
		let region = 'California';

		// poc location args can be length 1 or 2
		let locations = location.split(' ');
		// if length 1, municipality is null
		let municipality = null;
		// if length 2, parse municipality
		if (locations.length === 2) {
			municipality = toTitleCase(locations[0]);
		}
		return { time, country, region, municipality };
	}

	function initMap() {
		loader.load().then((google) => {
			const { Map } = google.maps;
			map = new Map(document.getElementById('map') as HTMLElement, {
				center: defaultCoordinates, // usa coordinates
				zoom: 4,
				mapId: '4504f8b37365c3d0'
			});
		});
	}

	function waitForMessages() {
		const interval = setInterval(() => {
			if (messageCount > 0) {
				clearInterval(interval);
				setTimeout(() => {
					priceTag.style.opacity = '1';
				}, 250); // fade in after 0.25 seconds
			}
		}, 100); // check every 100 milliseconds
	}

	async function resetMap() {
		if (map) {
			await resetWebsocket();
			markers.forEach((marker) => marker.setMap(null));
			markers = [];
			map.setCenter(defaultCoordinates);
			map.setZoom(4);
		}
	}

	function changeMapCenter(location: string) {
		if (map) {
			// clear existing markers
			markers.forEach((marker) => marker.setMap(null));
			markers = [];

			const geocoder = new google.maps.Geocoder();
			geocoder.geocode({ address: location }, (results, status) => {
				if (status === 'OK' && results && results.length > 0) {
					let location = results[0].geometry.location;
					map.setCenter(location);
					let zoomLevel;
					const types = results[0].types;
					if (types.includes('country')) {
						zoomLevel = 4; // Country level zoom
					} else if (types.includes('administrative_area_level_1')) {
						zoomLevel = 5; // State level zoom
					} else if (types.includes('locality')) {
						zoomLevel = 10; // City level zoom
					} else {
						zoomLevel = 12; // Default zoom for specific addresses
					}

					map.setZoom(zoomLevel);

					const { AdvancedMarkerElement } = google.maps.marker;

					priceTag = document.createElement('div');
					priceTag.textContent = `$${price}k`;

					const priceTagstyles = {
						backgroundColor: '#4285f4',
						borderRadius: '8px',
						color: '#ffffff',
						fontSize: '14px',
						padding: '10px 15px',
						position: 'relative',
						top: '-15px',
						opacity: '0',
						transition: 'opacity 0.5s ease-in'
					};

					Object.assign(priceTag.style, priceTagstyles);

					const pseudoElement = document.createElement('div');

					const pseudoElementStyles = {
						content: '""',
						position: 'absolute',
						left: '50%',
						top: '100%',
						transform: 'translate(-50%, 0)',
						width: '0',
						height: '0',
						borderLeft: '8px solid transparent',
						borderRight: '8px solid transparent',
						borderTop: '8px solid #4285F4'
					};

					Object.assign(pseudoElement.style, pseudoElementStyles);

					priceTag.appendChild(pseudoElement);

					const marker = new AdvancedMarkerElement({
						map,
						position: location,
						content: priceTag
					});

					markers.push(marker);

					waitForMessages();
				} else {
					console.error('geocode not successful:', status);
				}
			});
		}
	}

	onMount(() => {
		initMap();
	});

	$: if (priceTag) {
		priceTag.textContent = `${price}`;
	}
</script>

<div class="search-bar-container">
	<form class="search-bar" on:submit={handleSearch}>
		<input
			type="text"
			class="search-input"
			placeholder="Search for 'california gdp now'"
			bind:value={searchQuery}
		/>
	</form>
</div>

<div class="map-container">
	<div id="map" />
</div>

<style>
	:global(html),
	:global(body) {
		background: white;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
			Cantarell, 'Helvetica Neue', sans-serif;
	}

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
		width: calc(100% - 22px); /* Reduce width by 5px */
		padding: 10px;
		margin: 15px 0; /* Increase margin around the search input */
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 6px;
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
