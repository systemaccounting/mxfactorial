import React from 'react'
import { Router } from '@reach/router'

import LandingScreen from 'screens/LandingScreen'
import HomeScreen from 'screens/HomeScreen'
import CreateAccount from 'screens/CreateAccount'
import RequestScreen from 'screens/RequestScreen'

import Providers from 'providers'

import PrivateRoutes from 'screens/private'
import PublicRoutes from 'screens/public'
import NotFound from 'screens/notFound'

import './App.css'

const App = () => (
  <Providers>
    <Router>
      <NotFound default />
      <PrivateRoutes path="/">
        {props => (
          <React.Fragment>
            <HomeScreen path="/account" />
            <RequestScreen path="/requests" />
          </React.Fragment>
        )}
      </PrivateRoutes>
      <PublicRoutes path="/auth" />
    </Router>
  </Providers>
)

export default App
