import { writable } from 'svelte/store';

const account = writable("");

const setAccount = acct => account.set(acct);

export {
	account,
	setAccount,
}