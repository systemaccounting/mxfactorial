import { graphql } from 'react-apollo'
import { fetchTransactions } from 'queries/transactions'

export default graphql(fetchTransactions, {
  options: props => ({ variables: { user: props.user.username } }),
  props: ({ data: { transactions, loading } }) => ({
    transactions,
    isTransactionsLoading: loading
  })
})
