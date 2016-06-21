import React from 'react';
import {IndexRoute, Route} from 'react-router';

import { submitAuthDetails, logOutUser } from './actions/signUpActions';

import { getItem } from './storage/localStore';

import {
  LandingPage,
  HomePage,
  CreateAccountInfo,
  CreateAccount,
  BaseLayout
} from './containers';


export default (store) => {

  const checkForLoginDetails = () => {
    let details = getItem('mxUser');

    if (details) {
      store.dispatch(submitAuthDetails(details))
    } else {
      store.dispatch(logOutUser())
    }
  }

  checkForLoginDetails()

  const requireAuth = (nextState, replace, callback) => {
    const { accountDetails : { isAuthenticated } } = store.getState();
    if (!isAuthenticated) {
      replace({
        pathname: '/',
      })
    }
    callback();
  }

  const redirectAuth = (nextState, replace, callback) => {
    const { accountDetails: { isAuthenticated } } = store.getState();

    if (isAuthenticated) {
      replace({
        pathname: '/home',
      })
    }
    callback();
  }

  return (
    <Route path="/" component={BaseLayout}>
      <IndexRoute component={LandingPage} onEnter={redirectAuth}/>
      <Route path="/CreateAccountInfo/:id" component={CreateAccountInfo} onEnter={redirectAuth}/>
      <Route path="/CreateAccount/:id" component={CreateAccount} onEnter={redirectAuth}/>
      <Route path="/home" component={HomePage} onEnter={requireAuth}/>
    </Route>
  );
};
