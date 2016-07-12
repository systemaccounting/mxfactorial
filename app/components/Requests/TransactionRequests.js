import React, { Component, PropTypes } from 'react';
import map from 'lodash/map';
import transactionTotal from 'selectors/transaction/transaction-total';

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
    const { transactions } = this.props;

    return map(transactions, (item, key) => (
      <div className='indicator radius5 transaction-history__item' key={ key }
        onClick={ that.navigateToDetail.bind(that, key) }>
        <div className='transaction-item-header'>35 seconds ago, { item.cr_author }</div>
        <div className='font22 text-right'>({ transactionTotal(item.transaction_item).toFixed(3) })</div>
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
  transactions: PropTypes.object
};

TransactionRequests.contextTypes = {
  router: PropTypes.object
};
