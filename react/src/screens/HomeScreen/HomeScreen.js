import React, { Component } from 'react'

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

  handleSignOut = () => {
    const { navigate, signOut } = this.props
    return signOut().then(() => {
      navigate('/')
    })
  }

  render() {
    const { user } = this.props
    return (
      <MainLayout>
        <AccountHeader title={user.username} balance={this.state.balance} />
        <Transaction fetchTransactions={this.props.fetchTransactions} />
      </MainLayout>
    )
  }
}

export default HomeScreen
