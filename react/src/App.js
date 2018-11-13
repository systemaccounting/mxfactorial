import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import 'font-awesome/css/font-awesome.min.css'

import Providers from 'providers'
import PrivateRoutes from 'screens/private'
import PublicRoutes from 'screens/public'
import NotFound from 'screens/notFound'

import './App.css'

const App = () => (
  <Providers>
    <BrowserRouter>
      <Switch>
        <Route path="/auth" component={PublicRoutes} />
        <Route path="/" component={PrivateRoutes} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  </Providers>
)

export default App
