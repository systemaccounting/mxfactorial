import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import withTransactions from 'decorators/withTransactions'
import RequestScreen from './RequestScreen'

export default compose(
  withUser,
  withAuth,
  withTransactions,
  withApi
)(RequestScreen)
