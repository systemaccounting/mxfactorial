import { graphql } from 'react-apollo'
import { fetchTransactions } from 'queries/transactions'

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

export function renderProps({ data: { transactions, loading, refetch } }) {
  return {
    transactions: transactions ? transactions.sort(sortByArrpovalTime) : [],
    refetchTransactions: refetch,
    isTransactionsLoading: loading
  }
}

export default graphql(fetchTransactions, {
  options: props => ({ variables: { user: props.user.username } }),
  props: renderProps
})
