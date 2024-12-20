import { writable } from 'svelte/store'

const initial: App.ITransaction[] = [];

const requestsPending = writable(initial);

export {
	requestsPending,
}