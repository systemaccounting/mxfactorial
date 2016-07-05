import React, { Component, PropTypes } from 'react';

import EmailInput from './EmailSetting/EmailInput';
import NotificationSetting from './NotificationSetting';
import AccountSettingAction from './AccountSettingAction';
import Header from 'components/Header/Header';

export default class AccountSettingSection extends Component {
  constructor(props) {
    super(props);
    this.navigateToPage = this.navigateToPage.bind(this);
  }

  navigateToPage(path) {
    this.context.router.push(path);
  }

  render() {
    const { email, children } = this.props;

    return (
      <div className='account-setting'>
        <Header headerTitle='Account Settings'/>
        <div className='container' style={ { width: 300 } }>
          <EmailInput email={ email } handleClick={ this.navigateToPage.bind(null, '/AccountSetting/NewEmail') }/>
          <NotificationSetting />
          <AccountSettingAction
            handleChangePassword={ this.navigateToPage.bind(null, '/AccountSetting/NewPassword') }
            handleEditProfile={ this.navigateToPage.bind(null, '/AccountProfile') }/>
          { children }
        </div>
      </div>
    );
  }
}

AccountSettingSection.propTypes = {
  email: PropTypes.string,
  children: PropTypes.node
};

AccountSettingSection.contextTypes = {
  router: PropTypes.object
};
