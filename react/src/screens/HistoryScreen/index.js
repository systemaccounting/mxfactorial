import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import withTransactions from 'decorators/withTransactions'
import HistoryScreen from './HistoryScreen'

export default compose(
  withUser,
  withAuth,
  withApi,
  withTransactions
)(HistoryScreen)
