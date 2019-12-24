import React from 'react'
import 'font-awesome/css/font-awesome.min.css'

import { Switch, Route } from 'react-router-dom'

import withUser from 'decorators/withUser'
import PrivateRoutes from 'screens/private'
import PublicRoutes from 'screens/public'

import './App.css'

export function App({ userLoading, user }) {
  if (userLoading) {
    return <div>Loading...</div>
  }

  if (user) {
    return (
      <Switch>
        <Route path="/auth" component={PublicRoutes} />
        <Route path="/" component={PrivateRoutes} />
      </Switch>
    )
  }

  // If user is not found render public routes only
  return <PublicRoutes />
}

export default withUser(App)
