import { compose } from 'ramda'
import { graphql } from 'react-apollo'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'

import { fetchTransactionsById } from 'queries/transactions'
import HistoryDetailScreen from './HistoryDetailScreen'

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

const withTransaction = graphql(fetchTransactionsById, {
  options: props => ({ variables: { transactionId: props.match.params.uuid } }),
  props: renderProps
})

export default compose(withApi, withUser, withTransaction)(HistoryDetailScreen)
