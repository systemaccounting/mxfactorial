import React from 'react';
import { IndexRoute, Route } from 'react-router';

import LandingPage from 'components/LandingPage/LandingPage';
import BaseLayout from 'components/Layout/BaseLayout';
import HomePage from 'components/Home/Home';
import CreateAccountInfo from 'components/CreateAccountInfo/CreateAccountInfo';
import CreateAccount from 'components/CreateAccount/CreateAccount';
import TransactionHistory from 'components/TransactionHistory/TransactionHistory';
import TransactionSuccess from 'containers/TransactionHistory/TransactionSuccess';
import TransactionDetails from 'components/TransactionDetails/TransactionDetails';
import {
  AccountSettingSection, EmailPopup, EmailSuccess, PasswordSuccess
} from 'components/AccountSetting';
import PasswordPopup from 'containers/AccountSetting/PasswordPopup';

export default () => {

  return (
    <Route path='/' component={ BaseLayout }>
      <IndexRoute component={ LandingPage }/>
      <Route path='/CreateAccountInfo/:id' component={ CreateAccountInfo }/>
      <Route path='/CreateAccount/:id' component={ CreateAccount }/>
      <Route path='/home' component={ HomePage }/>
      <Route path='/TransactionHistory' component={ TransactionHistory }>
        <Route path='success' component={ TransactionSuccess }/>
      </Route>
      <Route path='/TransactionDetails' component={ TransactionDetails }/>
      <Route path='/AccountSetting' component={ AccountSettingSection }>
        <Route path='NewEmail' component={ EmailPopup }/>
        <Route path='EmailSuccess' component={ EmailSuccess }/>
        <Route path='NewPassword' component={ PasswordPopup }/>
        <Route path='PasswordSuccess' component={ PasswordSuccess }/>
      </Route>
    </Route>
  );
};
