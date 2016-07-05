import React, { Component, PropTypes } from 'react';

import Header from 'components/Header/Header';

import AccountProfileForm from 'containers/AccountProfileSetting/AccountProfileForm';

export default class AccountProfilePage extends Component {
  render() {
    return (
      <div className='account-setting'>
        <Header backLink='/AccountSetting'/>
        <div className='container' style={ { width: 300 } }>
          <AccountProfileForm />
          { this.props.children }
        </div>
      </div>
    );
  }
}

AccountProfilePage.propTypes = {
  children: PropTypes.node
};

AccountProfilePage.contextTypes = {
  router: PropTypes.object
};
