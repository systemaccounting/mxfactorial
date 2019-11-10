import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import withTransactions from 'decorators/withTransactions'
import withGroupedTransactions from '../../containers/GroupTransactionsContainer/withGroupedTransactions'
import RequestScreen from './RequestScreen'

export default compose(
  withUser,
  withAuth,
  withTransactions,
  withApi,
  withGroupedTransactions
)(RequestScreen)
