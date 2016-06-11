// Production URL for web client: http://mxfactorial.org/systemaccounting
// Production URL for SSL-enabled web client: https://mxfactorial.appspot.com/systemaccounting

// Production URL for API: http://api.mxfactorial.org/systemaccounting
// Production URL for SSL-enabled API: https://api.mxfactorial.appspot.com/systemaccounting

// IMPORTANT NOTE 1: 
// An 'api' subdomain has yet to be added to the SSL-enabled environment for the API,
// which requires inserting a 'dispatch.yaml' into the project's root: 
// https://cloud.google.com/appengine/docs/flexible/nodejs/how-requests-are-routed

// IMPORTANT NOTE 2:
// In the future, these variables will not be set manually. Rather,
// the web server will set these variables to determine whether
// the npm script is instantiating for 'development' or 'production' 
// (localhost vs. mxfactorial.org/systemaccounting).

export const BASE_URL = 'http://api.mxfactorial.org/systemaccounting'
//export const BASE_URL = 'http://localhost:8080/systemaccounting'

/**
 * cosntants for signup process
 * @author kishan
 */
export const SUBMIT_PROFILE_DETAILS = 'SUBMIT_PROFILE_DETAILS'
export const SUBMIT_AUTH_DETAILS= 'SUBMIT_AUTH_DETAILS'
export const CREATE_ACCOUNT ='CREATE_ACCOUNT'