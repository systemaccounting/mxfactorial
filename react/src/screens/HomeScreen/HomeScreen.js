import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import { fetchRules } from 'queries/rules'
import { Form } from 'react-final-form'
import { createTransaction } from 'queries/requests'

import AccountHeader from './components/AccountHeader'
import Transaction from './components/Transaction/index'

class HomeScreen extends Component {
  state = {
    failed: false,
    balance: 0,
    error: null
  }

  componentDidMount() {
    this.getBalance()
  }

  getBalance = async () => {
    const { fetchBalance } = this.props
    try {
      const balance = await fetchBalance()
      this.setState({ balance })
    } catch (error) {
      this.setState({ error })
    }
  }

  fetchRules = transactions => {
    const { client } = this.props
    return client.query({
      query: fetchRules,
      addTypename: false,
      variables: {
        transactions: transactions.map(({ uuid, ...rest }) => rest)
      }
    })
  }

  onRequestTransactions = async ({ type, items }) => {
    const { history, refetchTransactions } = this.props
    await this.props.createTransaction(items)
    await refetchTransactions()
    // Go to requests screen
    return history.push('/requests')
  }

  render() {
    const { user } = this.props
    return (
      <div data-id="homeScreen">
        <AccountHeader title={user.username} balance={this.state.balance} />
        <Form
          component={Transaction}
          username={user.username}
          fetchTransactions={this.props.fetchTransactions}
          initialValues={{ recipient: '', type: 'credit', items: [] }}
          onSubmit={this.onRequestTransactions}
          fetchRules={this.fetchRules}
        />
      </div>
    )
  }
}

export { HomeScreen }

export default graphql(createTransaction, {
  props: ({ ownProps, mutate }) => ({
    createTransaction: transactions =>
      mutate({
        variables: { items: transactions }
      })
  })
})(HomeScreen)
