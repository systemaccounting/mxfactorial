import { compose } from 'ramda'

import withApi from 'decorators/withApi'
import RequestDetailScreen from './RequestDetailScreen'

export default compose(withApi)(RequestDetailScreen)
