import React from 'react'
import { Switch, Route } from 'react-router-dom'

import LandingScreen from '../LandingScreen'
import NotFound from '../notFound'

class PublicRoutes extends React.Component {
  render() {
    const { location, match } = this.props
    return (
      <Switch location={location}>
        <Route exact path={`${match.url}/`} component={LandingScreen} />
        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default PublicRoutes
