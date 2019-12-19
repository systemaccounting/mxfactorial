import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import LandingScreen from '../LandingScreen'

class PublicRoutes extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={LandingScreen} />
        <Redirect to="/" />
      </Switch>
    )
  }
}

export default PublicRoutes
