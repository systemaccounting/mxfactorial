import React from 'react'

import { Switch, Route } from 'react-router-dom'

import withUser from 'decorators/withUser'
import HomeScreen from '../HomeScreen'
import RequestScreen from '../RequestScreen'
import RequestDetailScreen from '../RequestDetailScreen'
import HistoryScreen from '../HistoryScreen'
import NotFound from '../notFound'

export const Loading = () => <div>Loading...</div>

export class PrivateRoutes extends React.Component {
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
    return (
      <Switch>
        <Route exact path={`/account`} component={HomeScreen} />
        <Route exact path={`/requests`} component={RequestScreen} />
        <Route exact path={`/requests/:uuid`} component={RequestDetailScreen} />
        <Route exact path={`/history`} component={HistoryScreen} />
        <Route component={NotFound} />
      </Switch>
    )
  }

  render() {
    const { user, userLoading } = this.state
    if (user && !userLoading) {
      return this.renderRoutes()
    } else if (userLoading) {
      return <Loading />
    }
    return null
  }
}

export default withUser(PrivateRoutes)
