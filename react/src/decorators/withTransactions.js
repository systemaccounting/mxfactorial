import { graphql } from 'react-apollo'
import { fetchTransactions } from 'queries/requests'

function sortByArrpovalTime(a, b) {
  const approvalTimeA = a.creditor_approval_time || a.debitor_approval_time
  const approvalTimeB = b.creditor_approval_time || b.debitor_approval_time
  if (approvalTimeA > approvalTimeB) {
    return -1
  }
  if (approvalTimeA < approvalTimeB) {
    return 1
  }
  return 0
}

// https://www.apollographql.com/docs/react/api/react-apollo/#render-prop-function
export function renderProps({ data: { requestsByAccount, loading, refetch } }) {
  let transactions = requestsByAccount
  return {
    transactions: transactions ? transactions.sort(sortByArrpovalTime) : [],
    refetchTransactions: refetch,
    isTransactionsLoading: loading
  }
}

export default graphql(fetchTransactions, {
  options: props => ({ variables: { account: props.user.username } }),
  props: renderProps
})
