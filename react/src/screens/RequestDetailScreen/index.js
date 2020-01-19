import { compose } from 'ramda'
import { graphql } from 'react-apollo'
import { fromNow } from 'utils/date'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'

import { fetchRequestById } from 'queries/requests'
import RequestDetailScreen from './RequestDetailScreen'

const withTransaction = graphql(fetchRequestById, {
  options: props => ({ variables: { transactionId: props.match.params.uuid } }),
  props: ({ data, ownProps }) => {
    const { username } = ownProps.user
    // find non-rule generated request
    const request =
      data.requestsByID && data.requestsByID.length
        ? data.requestsByID.find(item => !item.rule_instance_id)
        : {}
    const isCredit = request.creditor === username
    const requestTotal = data.requestsByID
      ? data.requestsByID.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      : 0

    return {
      isRequestLoading: data.loading,
      isCredit,
      requestTotal,
      transactionId: request.transaction_id,
      contraAgent: isCredit ? request.debitor : request.creditor,
      requestTime:
        request.creditor_approval_time || request.debitor_approval_time,
      requestItems: data.requestsByID || [],
      ruleInstanceId: data.requestsByID
        ? data.requestsByID.find(item => item.rule_instance_id).rule_instance_id
        : 0
      // isCreditor: ownProps.
      // requestInitiator: data.req
    }
  }
})

export default compose(withApi, withUser, withTransaction)(RequestDetailScreen)
