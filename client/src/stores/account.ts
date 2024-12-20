import { writable, get } from 'svelte/store'

const account = writable('')

const setAccount = (acct: string) => {
	account.set(acct)
};

const getAccount = () => get(account);

export {
	account,
	getAccount,
	setAccount,
}