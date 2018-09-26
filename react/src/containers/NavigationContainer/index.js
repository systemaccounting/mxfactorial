import { compose } from 'ramda'

import withAuth from 'decorators/withAuth'
import Menu from 'components/Menu'

export default compose(withAuth)(Menu)
