import { connect } from 'react-redux';

import PasswordPopup from 'components/AccountSetting/PasswordSetting/PasswordPopup';
import { updateAccountSettingError } from 'actions/accountSettingActions';

function mapStateToProps(state) {
  return {
    errorMessage: state.accountSetting.errorMessage
  };
}

const mapDispatchToProps = {
  updateAccountSettingError
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordPopup);
