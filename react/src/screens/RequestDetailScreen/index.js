import { compose } from 'ramda'
import { graphql } from 'react-apollo'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'

import { fetchRequestById } from 'queries/requests'
import RequestDetailScreen from './RequestDetailScreen'

const withTransaction = graphql(fetchRequestById, {
  options: props => ({ variables: { transactionId: props.match.params.uuid } })
})

export default compose(withApi, withUser, withTransaction)(RequestDetailScreen)
