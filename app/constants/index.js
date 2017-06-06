import merge from 'lodash/merge';
import moment from 'moment-timezone';

export const BASE_URL = 'https://mxfactorial.herokuapp.com/systemaccounting';
export const SOCKET_URL = 'https://mxfactorial.herokuapp.com/';
// export const BASE_URL = 'http://192.168.66.131:8080/systemaccounting';
// export const SOCKET_URL = 'http://192.168.66.131:8080/';

export const TZ = moment.tz.guess();

export const DATE_FORMAT = Object.freeze({
  fullDateWithTimezone: 'dddd, MMM DD, YYYY, h:mm A z',
  timeOnlyWithTimezone: 'h:mm A z'
});

export const MONEY_FORMAT = '(0,0.000)';

export const GET_EMPTY_TRANSACTION = (key, info)=>(merge({
  key,
  name: '',
  value: 0,
  quantity: 0,
  cr_account: '',
  db_account: '',
  units_measured: '',
  unit_of_measurement: '',
  rule_instance_id: ''
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
