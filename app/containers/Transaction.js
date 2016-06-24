import { connect } from 'react-redux';

import TransactionSection from 'components/Transaction/TransactionSection';
import {
  addTransaction, removeTransaction, updateTransaction, postTransaction, updateCRAccount, clearError
} from 'actions/transactionActions';
import { transactionAmountSelector, transactionSelector } from 'selectors/transaction';

function mapStateToProps(state) {
  const { transaction_item, transactionError } = state;
  return {
    transaction_item,
    transactionError,
    transactionAmount: transactionAmountSelector(state),
    transaction: transactionSelector(state)
  };
}

const mapDispatchToProps = {
  addTransaction, removeTransaction, updateTransaction, postTransaction, updateCRAccount, clearError
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSection);
