import { writable } from 'svelte/store'

const initial: App.ITransaction[] = [];

const history = writable(initial);

export {
	history,
}