import { connect } from 'react-redux';

import { CreateAccount10Body } from 'components/CreateAccountInfoBody';
import { postCreateAccount } from 'actions/signUpActions';

function mapStateToProps(state) {
  return {
    accountDetails: state.accountDetails
  };
}

const mapDispatchToProps = {
  postCreateAccount
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount10Body);
