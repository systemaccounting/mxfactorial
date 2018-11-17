import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'
import RequestDetailScreen from './RequestDetailScreen'

export default compose(
  withApi,
  withUser
)(RequestDetailScreen)
