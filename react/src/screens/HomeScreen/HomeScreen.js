import React, { Component } from 'react'
import rulesQuery from 'queries/rules'

import MainLayout from 'components/MainLayout'
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
      query: rulesQuery,
      variables: {
        transactions
      }
    })
  }

  render() {
    const { user } = this.props
    console.log(this.props)
    return (
      <MainLayout>
        <div data-id="homeScreen">
          <AccountHeader title={user.username} balance={this.state.balance} />
          <Transaction
            fetchTransactions={this.props.fetchTransactions}
            fetchRules={this.fetchRules}
          />
        </div>
      </MainLayout>
    )
  }
}

export default HomeScreen
