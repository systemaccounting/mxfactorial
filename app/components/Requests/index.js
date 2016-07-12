import React, { Component, PropTypes } from 'react';

import PageLayout from 'components/Layout/PageLayout';
import TransactionRequests from './TransactionRequests';
import FilterAction from './FilterAction';

export default class Requests extends Component {
  componentDidMount() {
    this.props.getTransaction(undefined);
  }

  render() {
    const { transactions, requestsFilter, setRequestsFilter } = this.props;

    return (
      <PageLayout className='transaction-requests'>
        <FilterAction filter={ requestsFilter }
          handleActive={ setRequestsFilter.bind(this, 'active') }
          handleRejected={ setRequestsFilter.bind(this, 'rejected') }/>
        <TransactionRequests transactions={ transactions }/>
      </PageLayout>
    );
  }
}

Requests.propTypes = {
  transactions: PropTypes.object,
  setRequestsFilter: PropTypes.func,
  requestsFilter: PropTypes.string,
  getTransaction: PropTypes.func
};
