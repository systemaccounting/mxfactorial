import merge from 'lodash/merge';

export const BASE_URL = 'https://mxfactorial.firebaseapp.com/systemaccounting';
// export const BASE_URL = 'http://localhost:8080/systemaccounting'

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
