import { connect } from 'react-redux';

import TransactionSuccess from 'components/TransactionHistory/TransactionSuccess';
import { clearTransaction } from 'actions/transactionActions';

const mapDispatchToProps = {
  clearTransaction
};

export default connect(undefined, mapDispatchToProps)(TransactionSuccess);
