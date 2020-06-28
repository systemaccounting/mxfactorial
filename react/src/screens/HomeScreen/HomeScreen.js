import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import { fetchRules } from 'queries/rules'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { createTransaction } from 'queries/requests'

import AccountHeader from './components/AccountHeader'
import Transaction from './components/Transaction/index'
import { createCalculator } from './decorators'

const initialValues = {
  recipient: '',
  type: 'credit',
  items: [
    {
      name: '',
      price: '',
      quantity: '',
      author: '',
      debitor: '',
      creditor: ''
    }
  ]
}

class HomeScreen extends Component {
  state = {
    failed: false,
    balance: 0,
    error: null
  }

  constructor(props) {
    super(props)
    this.calculator = createCalculator({ username: props.user.username })
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

  onRequestTransactions = async ({ type, items, rules }) => {
    const { history, refetchTransactions } = this.props
    await this.props.createTransaction([...items, ...rules])
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
          initialValues={initialValues}
          onSubmit={this.onRequestTransactions}
          fetchRules={this.fetchRules}
          decorators={[this.calculator]}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators
          }}
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
