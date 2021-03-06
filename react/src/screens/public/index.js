import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import LandingScreen from '../LandingScreen'

export default function PublicRoutes() {
  return (
    <Switch>
      <Route exact path="/auth" component={LandingScreen} />
      <Redirect to="/auth" />
    </Switch>
  )
}
