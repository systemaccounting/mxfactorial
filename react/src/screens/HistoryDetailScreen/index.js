import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'
import HistoryDetailScreen from './HistoryDetailScreen'

export default compose(
  withApi,
  withUser
)(HistoryDetailScreen)
