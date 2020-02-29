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
    data.transactionsByID && data.transactionsByID.length
      ? data.transactionsByID.find(item => !item.rule_instance_id)
      : {}
  const isCredit = request.creditor === username
  const requestTotal = data.transactionsByID
    ? data.transactionsByID.reduce(
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
    transactionItems: data.transactionsByID || [],
    ruleInstanceIds: data.transactionsByID
      ? data.transactionsByID
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
