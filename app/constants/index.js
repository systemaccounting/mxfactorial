// Current production URL for SSL-enabled web client: https://mxfactorial.appspot.com

// In the future, these variables will not be set manually. Rather,
// the web server will set these variables to determine whether
// the npm script is instantiating for 'development' or 'production' 
// (localhost vs. mxfactorial.org/systemaccounting).

export const BASE_URL = 'https://mxfactorial.appspot.com/systemaccounting'
//export const BASE_URL = 'http://localhost:8080/systemaccounting'

/**
 * cosntants for signup process
 * @author kishan
 */
export const SUBMIT_PROFILE_DETAILS = 'SUBMIT_PROFILE_DETAILS'
export const SUBMIT_AUTH_DETAILS= 'SUBMIT_AUTH_DETAILS'
export const CREATE_ACCOUNT ='CREATE_ACCOUNT'

export const GET_EMPTY_TRANSACTION = ()=>({
	item: '',
  value: 0,
  quantity: 0,
  cr_account:''
})
