import React from 'react';
import { IndexRoute, Route } from 'react-router';

import LandingPage from 'components/LandingPage/LandingPage';
import BaseLayout from 'components/Layout/BaseLayout';
import HomePage from 'components/Home/Home';
import CreateAccountInfo from 'components/CreateAccountInfo/CreateAccountInfo';
import CreateAccount from 'components/CreateAccount/CreateAccount';

export default () => {

  return (
    <Route path='/' component={ BaseLayout }>
      <IndexRoute component={ LandingPage }/>
      <Route path='/CreateAccountInfo/:id' component={ CreateAccountInfo }/>
      <Route path='/CreateAccount/:id' component={ CreateAccount }/>
      { /*@author kishan*/ }
      <Route path='/home' component={ HomePage }/>
    </Route>
  );
};
