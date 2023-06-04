import { writable } from 'svelte/store'

let initial: App.Transaction[];

const history = writable(initial);

export {
	history,
}