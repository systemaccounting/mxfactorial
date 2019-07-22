import { compose } from 'ramda'

import { withRouter } from 'react-router-dom'
import withUser from 'decorators/withUser'
import withAuth from 'decorators/withAuth'
import Menu from 'components/Menu'

export default compose(
  withUser,
  withAuth,
  withRouter
)(Menu)
