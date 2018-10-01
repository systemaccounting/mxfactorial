import React from 'react'

import { Switch, Route } from 'react-router-dom'

import withUser from 'decorators/withUser'
import HomeScreen from '../HomeScreen'
import RequestScreen from '../RequestScreen'
import NotFound from '../notFound'

class PrivateRoutes extends React.Component {
  state = {
    userLoading: false,
    user: null
  }

  static getDerivedStateFromProps(nextProps) {
    const { userLoading, user } = nextProps
    return { user, userLoading }
  }

  componentDidUpdate() {
    const { userLoading, user, location, history } = this.props
    if (!userLoading && user === null) {
      return history.replace('/auth')
    } else {
      return location.pathname === '/' ? history.push('/account') : null
    }
  }

  renderRoutes = () => {
    const { user } = this.props
    return (
      <Switch>
        <Route
          exact
          path={`/account`}
          render={() => <HomeScreen user={user} />}
        />
        <Route
          exact
          path={`/requests`}
          component={() => <RequestScreen user={user} />}
        />
        <Route component={NotFound} />
      </Switch>
    )
  }

  render() {
    const { user, userLoading } = this.state
    if (user && !userLoading) {
      return this.renderRoutes()
    } else if (userLoading) {
      return 'Loading...'
    }
    return null
  }
}

export default withUser(PrivateRoutes)
