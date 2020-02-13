import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import withRequests from 'decorators/withRequests'
import withGroupedTransactions from '../../containers/GroupTransactionsContainer/withGroupedTransactions'
import RequestScreen from './RequestScreen'

export default compose(
  withUser,
  withAuth,
  withRequests,
  withApi,
  withGroupedTransactions
)(RequestScreen)
