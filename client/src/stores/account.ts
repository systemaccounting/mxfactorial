import { persisted } from 'svelte-local-storage-store'
import { get } from 'svelte/store'

const key = 'mxfactorial:account'

const account = persisted(key, null, { storage: 'session' });

const setAccount = acct => account.set(acct);

const getAccount = () => get(account);

const removeAccount = () => sessionStorage.removeItem(key)

export {
	account,
	getAccount,
	setAccount,
	removeAccount
}