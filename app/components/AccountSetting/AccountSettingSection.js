import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EmailInput from './EmailSetting/EmailInput';
import NotificationSetting from './NotificationSetting';
import AccountSettingAction from './AccountSettingAction';
import Header from 'components/Header/Header';

export default class AccountSettingSection extends Component {

  constructor(props) {
    super(props);
    this.navigateToPage = this.navigateToPage.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleDiscardEmailChanges = this.handleDiscardEmailChanges.bind(this);
    this.state = { email: this.props.email };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.email !== this.props.email) {
      this.setState({
        email: nextProps.email
      });
    }
  }

  navigateToPage(pathname, query) {
    this.context.router.push({
      pathname,
      query
    });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handleDiscardEmailChanges() {
    this.setState({ email: this.props.email });
  }

  render() {
    const { email, children } = this.props;

    return (
      <div className='account-setting'>
        <Header headerTitle='Account Settings'/>
        <div className='container' style={ { width: 300 } }>
          <EmailInput handleEmailChange={ this.handleEmailChange } initialEmail={ email }
            currentEmail={ this.state.email }
            handleBlur={ this.navigateToPage.bind(null, '/AccountSetting/NewEmail') }
            handleDiscardEmailChanges={ this.handleDiscardEmailChanges }/>
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
  children: PropTypes.node,
  location: PropTypes.object
};

AccountSettingSection.contextTypes = {
  router: PropTypes.object
};
