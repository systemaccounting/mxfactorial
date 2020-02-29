import { compose } from 'ramda'
import { graphql } from 'react-apollo'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'

import { fetchRequestById, approveRequest } from 'queries/requests'
import RequestDetailScreen from './RequestDetailScreen'

export function renderProps({ data, ownProps }) {
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
    requestTotal: requestTotal.toFixed(3),
    transactionId: request.transaction_id,
    requestingAccount: isCredit ? request.debitor : request.creditor,
    expirationTime: request.expiration_time,
    requestTime:
      request.creditor_approval_time || request.debitor_approval_time,
    requestItems: data.requestsByID || [],
    ruleInstanceIds: data.requestsByID
      ? data.requestsByID
          .filter(item => item.rule_instance_id)
          .map(item => item.rule_instance_id)
      : []
  }
}

const withTransaction = graphql(fetchRequestById, {
  options: props => ({ variables: { transactionId: props.match.params.uuid } }),
  props: renderProps
})

const withApproveRequest = graphql(approveRequest, {
  props: ({ ownProps, mutate }) => ({
    approveRequest() {
      return mutate({
        variables: {
          items: ownProps.requestItems.map(item => {
            const { __typename, ...itemProps } = item
            return itemProps
          })
        }
      })
    }
  })
})

export default compose(
  withApi,
  withUser,
  withTransaction,
  withApproveRequest
)(RequestDetailScreen)
