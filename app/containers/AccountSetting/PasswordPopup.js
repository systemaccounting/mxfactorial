import { connect } from 'react-redux';

import PasswordPopup from 'components/AccountSetting/PasswordSetting/PasswordPopup';
import { updateAccountSettingError, patchPassword } from 'actions/accountSettingActions';

function mapStateToProps(state) {
  return {
    errorMessage: state.accountSetting.errorMessage,
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  updateAccountSettingError,
  patchPassword
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordPopup);
