import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import LandingPage from 'components/LandingPage/LandingPage';
import BaseLayout from 'components/Layout/BaseLayout';
import HomePage from 'components/Home/Home';
import CreateAccountInfo from 'components/CreateAccountInfo/CreateAccountInfo';
import CreateAccount from 'components/CreateAccount/CreateAccount';
import TransactionHistory from 'components/TransactionHistory/TransactionHistory';
import TransactionSuccess from 'containers/TransactionHistory/TransactionSuccess';
import TransactionDetails from 'components/TransactionDetails/TransactionDetails';
import {
  EmailSuccess, PasswordSuccess
} from 'components/AccountSetting';
import AccountSettingSection from 'containers/AccountSetting/AccountSettingSection';
import PasswordPopup from 'containers/AccountSetting/PasswordPopup';
import EmailPopup from 'containers/AccountSetting/EmailPopup';
import { AccountProfilePage, AccountProfileSuccess } from 'components/AccountProfileSetting';
import AccountProfileConfirm from 'containers/AccountProfileSetting/AccountProfileConfirm';

import TransactionRequestDetail from 'containers/TransactionRequestDetail';
import TransactionRequests from 'containers/Requests/TransactionRequests';
import RequestSentPopup from 'containers/Requests/RequestSentPopup';

import { requireAuth, handleLogout } from './auth-hooks';

export default (store) => {
  const handleEnter = requireAuth(store);

  return (
    <Route path='/' component={ BaseLayout }>
      <IndexRedirect to='/home' />

      <Route path='/login' component={ LandingPage }/>
      <Route path='/CreateAccountInfo/:id' component={ CreateAccountInfo }/>
      <Route path='/CreateAccount/:id' component={ CreateAccount }/>

      <Route path='/home' component={ HomePage } onEnter={ handleEnter }/>

      <Route path='/TransactionHistory' component={ TransactionHistory } onEnter={ handleEnter }>
        <Route path='success' component={ TransactionSuccess }/>
      </Route>

      <Route path='/TransactionDetails' component={ TransactionDetails } onEnter={ handleEnter }/>

      <Route path='/Requests' component={ TransactionRequests } onEnter={ handleEnter }>
        <Route path='RequestSent' component={ RequestSentPopup }/>
      </Route>

      <Route path='/TransactionRequestDetail/:id' component={ TransactionRequestDetail } onEnter={ handleEnter }/>

      <Route path='/AccountSetting' component={ AccountSettingSection } onEnter={ handleEnter }>
        <Route path='NewEmail' component={ EmailPopup }/>
        <Route path='EmailSuccess' component={ EmailSuccess }/>
        <Route path='NewPassword' component={ PasswordPopup }/>
        <Route path='PasswordSuccess' component={ PasswordSuccess }/>
      </Route>

      <Route path='/AccountProfile' component={ AccountProfilePage } onEnter={ handleEnter }>
        <Route path='Success' component={ AccountProfileSuccess }/>
        <Route path='Confirm' component={ AccountProfileConfirm }/>
      </Route>

      <Route path='logout' component={ null } onEnter={ handleLogout(store) }/>
    </Route>
  );
};
