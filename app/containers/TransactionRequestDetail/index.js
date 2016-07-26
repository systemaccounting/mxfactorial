import { connect } from 'react-redux';

import TransactionRequestDetail from 'components/TransactionRequestDetail';
import { getTransactionById } from 'actions/transactionActions';
import { getTransactionSelector, transactionAmountSelector } from 'selectors/transaction/transaction-details';
import relatedNotification from 'selectors/transaction/related-notification';
import { readOne } from 'actions/notificationActions';

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.params;

  return {
    transaction: getTransactionSelector(state, id),
    transactId: id,
    transactionTotal: transactionAmountSelector(state, id),
    notification: relatedNotification(state, id)
  };
}

const mapDispatchToProps = {
  getTransactionById,
  readOne
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionRequestDetail);
