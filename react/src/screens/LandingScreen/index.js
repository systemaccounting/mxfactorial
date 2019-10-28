import { compose } from 'ramda'

import withUser from 'decorators/withUser'
import withAuth from 'decorators/withAuth'
import LandingScreen from './LandingScreen'

export default compose(
  withUser,
  withAuth
)(LandingScreen)
