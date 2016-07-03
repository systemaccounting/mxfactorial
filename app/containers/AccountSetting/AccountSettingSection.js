import { connect } from 'react-redux';

import AccountSettingSection from 'components/AccountSetting/AccountSettingSection';

function mapStateToProps(state) {
  return {
    email: state.auth.user.account_profile && state.auth.user.account_profile.email_address
  };
}

export default connect(mapStateToProps)(AccountSettingSection);
