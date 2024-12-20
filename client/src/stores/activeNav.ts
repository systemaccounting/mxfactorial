import { writable, get } from 'svelte/store'

const activeNav = writable(false);

const switchActiveNav = () => {
	const current = get(activeNav);
	activeNav.set(!current);
}

export {
	activeNav,
	switchActiveNav,
}