import React, { Component, PropTypes } from 'react';
import map from 'lodash/map';

import TimeAgo from 'components/TimeAgo';

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

    return map(notifications, (item, key) => (
      <div className='indicator radius5 transaction-history__item' key={ key }
        onClick={ that.navigateToDetail.bind(that, item.key) }>
        <div className='transaction-item-header'>
          <TimeAgo time={ item.sent_time }/>, { item.sender_account } requested
        </div>
        <div className='font22 text-right'>({ item.payload && item.payload.total.toFixed(3) || 0 })</div>
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
