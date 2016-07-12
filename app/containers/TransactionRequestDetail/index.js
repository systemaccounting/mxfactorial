import { connect } from 'react-redux';

import TransactionRequestDetail from 'components/TransactionRequestDetail';
import { getTransactionById } from 'actions/transactionActions';
import { getTransactionSelector, transactionAmountSelector } from 'selectors/transaction/transaction-details';

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.params;

  return {
    transaction: getTransactionSelector(state, id),
    transactId: id,
    transactionTotal: transactionAmountSelector(state, id)
  };
}

const mapDispatchToProps = {
  getTransactionById
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionRequestDetail);
