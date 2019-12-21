import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'

import MainLayout from 'components/MainLayout'
import HomeScreen from '../HomeScreen'
import RequestScreen from '../RequestScreen'
import RequestDetailScreen from '../RequestDetailScreen'
import HistoryScreen from '../HistoryScreen'
import HistoryDetailScreen from '../HistoryDetailScreen'
import NotFound from '../notFound'

export default function PrivateRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route exact path="/account" component={HomeScreen} />
        <Route exact path="/requests" component={RequestScreen} />
        <Route exact path="/requests/:uuid" component={RequestDetailScreen} />
        <Route exact path="/history" component={HistoryScreen} />
        <Route exact path="/history/:uuid" component={HistoryDetailScreen} />
        <Redirect to="/account" />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  )
}
