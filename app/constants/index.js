// Current production URL for SSL-enabled web client: https://mxfactorial.appspot.com

// In the future, these variables will not be set manually. Rather,
// the web server will set these variables to determine whether
// the npm script is instantiating for 'development' or 'production'
// (localhost vs. mxfactorial.org/systemaccounting).
import merge from 'lodash/merge';

// export const BASE_URL = 'https://mxfactorial.appspot.com/systemaccounting';
export const BASE_URL = 'http://localhost:8081/systemaccounting';

export const GET_EMPTY_TRANSACTION = (key, info)=>(merge({
  key,
  name: '',
  value: 0,
  quantity: 0,
  cr_account: '',
  db_account: 'Sandy',
  units_measured: '',
  unit_of_measurement: ''
}, info));
