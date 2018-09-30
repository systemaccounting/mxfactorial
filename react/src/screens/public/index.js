import React from 'react'
import { Switch, Route } from 'react-router-dom'

import LandingScreen from '../LandingScreen'
import CreateAccount from '../CreateAccount'
import NotFound from '../notFound'

class PublicRoutes extends React.Component {
  render() {
    const { location, match, history } = this.props
    return (
      <Switch location={location}>
        <Route
          exact
          path={`${match.url}/`}
          render={() => <LandingScreen history={history} />}
        />
        <Route
          path={`${match.url}/create-account`}
          render={() => <CreateAccount />}
        />
        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default PublicRoutes
