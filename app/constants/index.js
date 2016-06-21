// Current production URL for SSL-enabled web client: https://mxfactorial.appspot.com

// In the future, these variables will not be set manually. Rather,
// the web server will set these variables to determine whether
// the npm script is instantiating for 'development' or 'production'
// (localhost vs. mxfactorial.org/systemaccounting).
export const BASE_URL = process.env.NODE_ENV === "production" ?
    'https://mxfactorial.appspot.com/systemaccounting':
    'http://localhost:8080/systemaccounting';
export const GET_EMPTY_TRANSACTION = ()=>({
	item: '',
  value: 0,
  quantity: 0,
  cr_account:''
})
export const SUBMIT_PROFILE_DETAILS = 'SUBMIT_PROFILE_DETAILS';
export const SUBMIT_AUTH_DETAILS= 'SUBMIT_AUTH_DETAILS';
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT';
export const GET_AUTH_DETAILS = 'GET_AUTH_DETAILS';
export const LOGOUT_USER = 'LOGOUT_USER';
