import { writable } from 'svelte/store'
import { get } from 'svelte/store'

const account = writable('')

const setAccount = acct => {
	account.set(acct)
};

const getAccount = () => get(account);

export {
	account,
	getAccount,
	setAccount,
}