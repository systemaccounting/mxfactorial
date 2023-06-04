import { writable } from 'svelte/store'

let initial: App.Transaction[];

const requestsPending = writable(initial);

export {
	requestsPending,
}