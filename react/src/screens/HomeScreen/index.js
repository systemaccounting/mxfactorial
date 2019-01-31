import { compose } from 'ramda'
import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import { withApollo } from 'react-apollo'
import HomeScreen from './HomeScreen'

export default compose(
  withAuth,
  withUser,
  withApi,
  withApollo
)(HomeScreen)
