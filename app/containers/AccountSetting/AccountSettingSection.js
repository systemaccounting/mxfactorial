import { connect } from 'react-redux';

import AccountSettingSection from 'components/AccountSetting/AccountSettingSection';

function mapStateToProps(state) {
  return {
    email: (state.auth.user && state.auth.user.account_profile) ? state.auth.user.account_profile[0].email_address : ''
  };
}

export default connect(mapStateToProps)(AccountSettingSection);
