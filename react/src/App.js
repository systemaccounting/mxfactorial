import React from 'react'
import 'font-awesome/css/font-awesome.min.css'

import withUser from 'decorators/withUser'
import PrivateRoutes from 'screens/private'
import PublicRoutes from 'screens/public'

import './App.css'

function App({ userLoading, user }) {
  if (userLoading) {
    return <div>Loading...</div>
  }

  if (user) {
    return <PrivateRoutes />
  }

  return <PublicRoutes />
}

export default withUser(App)
