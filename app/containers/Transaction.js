import { connect } from 'react-redux';

import TransactionSection from 'components/Transaction/TransactionSection';
import { addTransaction, removeTransaction, updateTransaction } from 'actions/transactionActions';
import { transactionAmountSelector } from 'selectors/transaction';

function mapStateToProps(state) {
  const { transaction_item } = state;
  return {
    transaction_item,
    transactionAmount: transactionAmountSelector(state)
  };
}

const mapDispatchToProps = { addTransaction, removeTransaction, updateTransaction };

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSection);
