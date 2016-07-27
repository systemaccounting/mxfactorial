import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';

import getNotifications from './state';
import { requestTransactionSelector } from 'selectors/transaction/transaction-requests';

export default createSelector(
  [getNotifications, requestTransactionSelector],
  (notifications, transactions) => (
    pickBy(notifications, (notification, key) => (!!transactions[notification.key]))
  ));
