import merge from 'lodash/merge';

// export const BASE_URL = 'https://mxfactorial.appspot.com/systemaccounting';
// export const SOCKET_URL = 'https://mxfactorial.appspot.com/';
export const BASE_URL = 'http://192.168.66.131:8081/systemaccounting';
export const SOCKET_URL = 'http://192.168.66.131:8081/';

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

export const ACCOUNT_NOFICATIONS = {
  publish_activity: 'Publish activity',
  password_per_transaction: 'Require password per transaction',
  password_per_request: 'Require password per request',
  notification_payment_receipt: 'Notify on payment receipt',
  notification_payment_sent: 'Notify on payment sent',
  notification_request_receipt: 'Notify on request receipt',
  notification_request_sent: 'Notify on request sent'
};
