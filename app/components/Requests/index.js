import React, { Component, PropTypes } from 'react';

import PageLayout from 'components/Layout/PageLayout';
import TransactionRequests from './TransactionRequests';
import FilterAction from './FilterAction';

export default class Requests extends Component {
  componentDidMount() {
    this.props.getTransaction(undefined);
  }

  render() {
    const { requestsFilter, setRequestsFilter, transactions, children, account } = this.props;

    var notifications = {};
    for (var trKey in transactions) {
      var newItem = {};
      newItem.id = trKey;
      newItem.key = trKey;
      newItem.sent_time = transactions[trKey].expiration_time;
      newItem.sender_account = transactions[trKey].cr_author;
      var trTotal = 0;
      var trItems = transactions[trKey].transaction_item;
      for (var i=0; i<trItems.length; i++ ) {
        trTotal += trItems[i].quantity * trItems[i].value;
      }
      var trDirection = transactions[trKey].cr_author == account ? 1 : -1;
      newItem.payload = { total: trTotal, direction: trDirection };
      notifications[trKey] = newItem;
    }

    return (
      <PageLayout className='transaction-requests'>
        <FilterAction filter={ requestsFilter }
          handleActive={ setRequestsFilter.bind(this, 'active') }
          handleRejected={ setRequestsFilter.bind(this, 'rejected') }/>
        <TransactionRequests notifications={ notifications }/>
        { children }
      </PageLayout>
    );
  }
}

Requests.propTypes = {
  notifications: PropTypes.object,
  setRequestsFilter: PropTypes.func,
  requestsFilter: PropTypes.string,
  getTransaction: PropTypes.func,
  children: PropTypes.node,
  transactions: PropTypes.object,
  account: PropTypes.string
};
