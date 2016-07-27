import { connect } from 'react-redux';

import RequestSentPopup from 'components/Requests/RequestSentPopup';
import { clearTransaction } from 'actions/transactionActions';

const mapDispatchToProps = {
  clearTransaction
};

export default connect(undefined, mapDispatchToProps)(RequestSentPopup);
