import { connect } from 'react-redux';
import { getValues, reset } from 'redux-form';

import AccountProfileConfirm from 'components/AccountProfileSetting/AccountProfileConfirm';
import { patchProfile, updateAccountSettingError } from 'actions/accountSettingActions';

function mapStateToProps(state) {
  return {
    errorMessage: state.accountSetting.errorMessage,
    profile: getValues(state.form.accountProfileForm),
    account: state.auth.user.account
  };
}

const mapDispatchToProps = {
  patchProfile,
  updateAccountSettingError,
  reset
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountProfileConfirm);
