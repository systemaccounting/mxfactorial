import React from 'react'
import { Router } from '@reach/router'

import LandingScreen from '../LandingScreen'

class PublicRoutes extends React.Component {
  render() {
    return (
      <Router>
        <LandingScreen path="/" />
      </Router>
    )
  }
}

export default PublicRoutes
