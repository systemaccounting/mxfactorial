import React from 'react'

import { compose } from 'react-apollo'
import { Switch, Route } from 'react-router-dom'

import withUser from 'decorators/withUser'
import MainLayout from 'components/MainLayout'
import HomeScreen from '../HomeScreen'
import RequestScreen from '../RequestScreen'
import RequestDetailScreen from '../RequestDetailScreen'
import HistoryScreen from '../HistoryScreen'
import HistoryDetailScreen from '../HistoryDetailScreen'
import NotFound from '../notFound'

function PrivateRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route exact path="/account" component={HomeScreen} />
        <Route exact path="/requests" component={RequestScreen} />
        <Route exact path="/requests/:uuid" component={RequestDetailScreen} />
        <Route exact path="/history" component={HistoryScreen} />
        <Route exact path="/history/:uuid" component={HistoryDetailScreen} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  )
}

export default compose(withUser)(PrivateRoutes)
