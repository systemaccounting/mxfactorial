import { graphql } from 'react-apollo'
import { fetchTransactions } from 'queries/transactions'

export default graphql(fetchTransactions)
