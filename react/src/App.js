import React from 'react'
import { Router } from '@reach/router'

import LandingScreen from 'screens/LandingScreen'
import HomeScreen from 'screens/HomeScreen'
import CreateAccount from 'screens/CreateAccount'
import RequestScreen from 'screens/RequestScreen'
import './App.css'

const App = () => (
  <Router>
    <LandingScreen exact path="/" />
    <CreateAccount path="account/create" />
    <HomeScreen path="account" />
    <RequestScreen path="requests" />
  </Router>
)

export default App
