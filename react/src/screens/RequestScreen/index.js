import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import RequestScreen from './RequestScreen'

export default compose(withAuth, withApi)(RequestScreen)
