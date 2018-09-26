import { compose } from 'ramda'
import withApi from 'decorators/withApi'
import withAuth from 'decorators/withAuth'
import HomeScreen from './HomeScreen'

export default compose(withAuth, withApi)(HomeScreen)
