import { connect } from 'react-redux';

import { CreateAccount10Body } from 'components/CreateAccountInfoBody';

function mapStateToProps(state) {
  return {
    accountDetails: state.accountDetails
  };
}

export default connect(mapStateToProps)(CreateAccount10Body);
