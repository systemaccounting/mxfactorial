import { compose } from 'ramda'
import { withApollo } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import withTransactions from 'decorators/withTransactions'
import HomeScreen from './HomeScreen'

export default compose(
  withAuth,
  withUser,
  withApi,
  withTransactions,
  withApollo,
  withRouter
)(HomeScreen)
