import { connect } from 'react-redux';

import TransactionSection from 'components/Transaction/TransactionSection';
import {
  addTransaction, removeTransaction, updateTransaction, postTransaction, updateCRAccount, updateError
} from 'actions/transactionActions';
import { transactionAmountSelector, newTransactionSelector } from 'selectors/transaction/new-transaction';

function mapStateToProps(state) {
  const { transaction_item, transactionError, cr_account } = state;
  return {
    transaction_item,
    transactionError,
    cr_account,
    transactionAmount: transactionAmountSelector(state),
    transaction: newTransactionSelector(state),
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  addTransaction, removeTransaction, updateTransaction, postTransaction, updateCRAccount, updateError
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSection);
