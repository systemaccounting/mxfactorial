import { connect } from 'react-redux';

import EmailPopup from 'components/AccountSetting/EmailSetting/EmailPopup';
import { patchEmail, updateAccountSettingError } from 'actions/accountSettingActions';

function mapStateToProps(state) {
  return {
    errorMessage: state.accountSetting.errorMessage,
    email: state.auth.user.account_profile && state.auth.user.account_profile.email_address,
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  patchEmail,
  updateAccountSettingError
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailPopup);
