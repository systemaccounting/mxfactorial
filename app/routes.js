import React from 'react';
import {IndexRoute, Route} from 'react-router';

import {
  LandingPage,
  HomePage,
  CreateAccountInfo,
  CreateAccount,
  BaseLayout,
  TransactionHistory,
  TransactionDetails
} from './containers';


export default () => {

  return (
    <Route path="/" component={BaseLayout}>
      <IndexRoute component={LandingPage}/>
      <Route path="/CreateAccountInfo/:id" component={CreateAccountInfo}/>
      <Route path="/CreateAccount/:id" component={CreateAccount}/>
      {/*@author kishan*/}
      <Route path="/home" component={HomePage}/>
      <Route path="/TransactionHistory" component={TransactionHistory}/>
      <Route path="/TransactionDetails" component={TransactionDetails}/>
    </Route>
  );
};
