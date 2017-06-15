import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import numeral from 'numeral';

import { MONEY_FORMAT } from 'constants/index';
import TimeAgo from 'components/TimeAgo';
import chronologicalNotificationSort from 'utils/chronologicalNotificationSort';

export default class TransactionRequests extends Component {
  constructor(props) {
    super(props);
    this.navigateToDetail = this.navigateToDetail.bind(this);
  }

  navigateToDetail(key) {
    this.context.router.push(`/TransactionRequestDetail/${key}`);
  }

  renderTransactionItems() {
    const that = this;
    const { notifications } = this.props;

    return map(chronologicalNotificationSort(notifications), (item, key) => (
      <div className='indicator radius5 transaction-history__item' key={ item.id }
        onClick={ that.navigateToDetail.bind(that, item.key) }>
        <div className='transaction-item-header'>
          <TimeAgo time={ item.sent_time }/>, { item.sender_account } requested
        </div>
        <div className='font22 text-right'>
          { numeral(item.payload
            && item.payload.total * (item.payload.direction || 1)
            || 0).format(MONEY_FORMAT) }
        </div>
      </div>
    ));
  }

  render() {
    return (
      <div>
        { this.renderTransactionItems() }
      </div>
    );
  }
}

TransactionRequests.propTypes = {
  notifications: PropTypes.object
};

TransactionRequests.contextTypes = {
  router: PropTypes.object
};
