import React from 'react';
import { connect } from 'react-redux';

import Requests from 'components/Requests';
import { getTransaction } from 'actions/transactionActions';
import { setRequestsFilter } from 'actions/requestActions';
import { requestTransactionSelector } from 'selectors/transaction/transaction-requests';

function mapStateToProps(state) {
  return {
    transactions: requestTransactionSelector(state),
    requestsFilter: state.requestsFilter
  };
}

const mapDispatchToProps = {
  getTransaction,
  setRequestsFilter
};

export default connect(mapStateToProps, mapDispatchToProps)(Requests);
