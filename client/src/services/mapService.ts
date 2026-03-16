import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const DEFAULT_COORDINATES = { lat: 39.8283, lng: -98.5795 }; // usa
let optionsSet = false;

export function createMapService(apiKey: string) {
	let map: google.maps.Map;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let markers = [] as any[];

	if (!optionsSet) {
		setOptions({
			key: apiKey,
			v: 'weekly',
			libraries: ['maps', 'marker', 'places']
		});
		optionsSet = true;
	}

	async function init() {
		const { Map } = await importLibrary('maps');
		map = new Map(document.getElementById('map') as HTMLElement, {
			center: DEFAULT_COORDINATES,
			zoom: 4,
			mapId: '4504f8b37365c3d0'
		});
	}

	async function reset() {
		if (map) {
			markers.forEach((marker) => marker.setMap(null));
			markers = [];
			map.setCenter(DEFAULT_COORDINATES);
			map.setZoom(4);
		}
	}

	async function centerOnLocation(location: string, priceTag: HTMLDivElement) {
		if (!map) return;

		markers.forEach((marker) => marker.setMap(null));
		markers = [];

		const { Geocoder } = await importLibrary('geocoding');
		const { AdvancedMarkerElement } = await importLibrary('marker');
		const geocoder = new Geocoder();
		geocoder.geocode({ address: location }, (results, status) => {
			if (status === 'OK' && results && results.length > 0) {
				const location = results[0].geometry.location;
				map.setCenter(location);

				let zoomLevel;
				const types = results[0].types;
				if (types.includes('country')) {
					zoomLevel = 4;
				} else if (types.includes('administrative_area_level_1')) {
					zoomLevel = 5;
				} else if (types.includes('locality')) {
					zoomLevel = 10;
				} else {
					zoomLevel = 12;
				}
				map.setZoom(zoomLevel);

				const marker = new AdvancedMarkerElement({
					map,
					position: location,
					content: priceTag
				});
				markers.push(marker);
			} else {
				console.error('geocode not successful:', status);
			}
		});
	}

	return { init, reset, centerOnLocation };
}

export function createPriceTag(): HTMLDivElement {
	const priceTag = document.createElement('div');

	Object.assign(priceTag.style, {
		backgroundColor: '#4285f4',
		borderRadius: '8px',
		color: '#ffffff',
		fontSize: '14px',
		padding: '10px 15px',
		position: 'relative',
		top: '-15px',
		opacity: '0',
		transition: 'opacity 0.5s ease-in'
	});

	const arrow = document.createElement('div');
	Object.assign(arrow.style, {
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
	});
	priceTag.appendChild(arrow);

	return priceTag;
}
