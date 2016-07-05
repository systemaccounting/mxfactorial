import { connect } from 'react-redux';

import EmailPopup from 'components/AccountSetting/EmailSetting/EmailPopup';
import { patchEmail, updateAccountSettingError, emailChanged } from 'actions/accountSettingActions';

function mapStateToProps(state) {
  return {
    errorMessage: state.accountSetting.errorMessage,
    email: state.auth.user.account_profile && state.auth.user.account_profile[0].email_address,
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  patchEmail,
  updateAccountSettingError,
  emailChanged
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailPopup);
