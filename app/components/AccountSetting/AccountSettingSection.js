import React, { Component, PropTypes } from 'react';

import EmailInput from './EmailSetting/EmailInput';
import NotificationSetting from './NotificationSetting';
import AccountSettingAction from './AccountSettingAction';
import Header from 'components/Header/Header';

export default class AccountSettingSection extends Component {

  constructor(props) {
    super(props);
    this.navigateToPage = this.navigateToPage.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.state = { email: this.props.email};
    this.key = '';
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    if (location.query.clear == 'true' && this.key != location.key) {
      this.key = location.key;
      this.setState({ email: this.props.email});
    }
  }

  navigateToPage(pathname, query) {
    this.context.router.push({
      pathname,
      query
    });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value});
  }

  render() {
    const { location, email, children } = this.props;

    return (
      <div className='account-setting'>
        <Header headerTitle='Account Settings'/>
        <div className='container' style={ { width: 300 } }>
          <EmailInput onEmailChange={ this.handleEmailChange } initialEmail={ email } currentEmail={ this.state.email } handleBlur={ this.navigateToPage.bind(null, '/AccountSetting/NewEmail') }/>
          <NotificationSetting />
          <AccountSettingAction
            handleChangePassword={ this.navigateToPage.bind(null, '/AccountSetting/NewPassword', null) }
            handleEditProfile={ this.navigateToPage.bind(null, '/AccountProfile', null) }/>
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