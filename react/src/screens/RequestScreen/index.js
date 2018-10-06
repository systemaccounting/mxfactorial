import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import withUser from 'decorators/withUser'
import RequestScreen from './RequestScreen'

export default compose(withUser, withAuth, withApi)(RequestScreen)
