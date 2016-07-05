import { connect } from 'react-redux';
import { reset } from 'redux-form';

import { CreateAccount10Body } from 'components/CreateAccountInfoBody';
import { postCreateAccount } from 'actions/signUpActions';

function mapStateToProps(state) {
  return {
    accountDetails: state.accountDetails
  };
}

const mapDispatchToProps = {
  postCreateAccount,
  reset
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount10Body);
