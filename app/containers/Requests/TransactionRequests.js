import React from 'react';
import { connect } from 'react-redux';

import Requests from 'components/Requests';
import { getTransaction } from 'actions/transactionActions';
import { setRequestsFilter } from 'actions/requestActions';
import rejectActiveSelector from 'selectors/notification/reject-active';

function mapStateToProps(state) {
  return {
    requestsFilter: state.requestsFilter,
    notifications: rejectActiveSelector(state),
    transactions: state.transactions,
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  getTransaction,
  setRequestsFilter
};

export default connect(mapStateToProps, mapDispatchToProps)(Requests);
