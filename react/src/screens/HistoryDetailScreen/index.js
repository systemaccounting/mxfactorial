import { compose } from 'ramda'
import { graphql } from 'react-apollo'

import withApi from 'decorators/withApi'
import withUser from 'decorators/withUser'
import { maxDate } from 'utils/date'

import { fetchTransactionsById } from 'queries/transactions'
import HistoryDetailScreen from './HistoryDetailScreen'

export function renderProps({ data, ownProps }) {
  const { username } = ownProps.user
  // find non-rule generated request
  const transaction =
    data.transactionsByID && data.transactionsByID.length
      ? data.transactionsByID.find(item => !item.rule_instance_id)
      : {}
  const isCredit = transaction.creditor === username
  const transactionTotal = data.transactionsByID
    ? data.transactionsByID.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    : 0

  return {
    isRequestLoading: data.loading,
    isCredit,
    transactionTotal: transactionTotal.toFixed(3),
    transactionId: transaction.transaction_id,
    transactionAccount: isCredit ? transaction.debitor : transaction.creditor,
    expirationTime: transaction.expiration_time,
    transactionTime: maxDate([
      transaction.creditor_approval_time,
      transaction.debitor_approval_time
    ]),
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
