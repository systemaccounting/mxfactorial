import React from 'react'
import { Switch, Route } from 'react-router-dom'

import LandingScreen from '../LandingScreen'
import CreateAccount from '../CreateAccount'
import NotFound from '../notFound'

class PublicRoutes extends React.Component {
  render() {
    const { location, match } = this.props
    return (
      <Switch location={location}>
        <Route exact path={`${match.url}/`} component={LandingScreen} />
        <Route
          exact
          path={`${match.url}/create-account`}
          component={CreateAccount}
        />
        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default PublicRoutes
