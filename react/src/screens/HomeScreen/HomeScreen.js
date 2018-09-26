import React, { Component } from 'react'
import { Redirect } from '@reach/router'

import { asyncPipe } from 'utils'

import MainLayout from 'components/MainLayout'
import AccountHeader from './components/AccountHeader'
import Transaction from './components/Transaction/index'

class HomeScreen extends Component {
  state = {
    user: null,
    failed: false,
    balance: 0,
    error: null
  }

  componentDidMount() {
    const { getUserData, getBalance } = this
    asyncPipe(getUserData, getBalance)
  }

  componentWillUnmount() {
    this.setState({ user: null })
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

  getUserData = async () => {
    const { currentUserInfo } = this.props
    try {
      const user = await currentUserInfo()
      this.setState({ user })
    } catch (error) {
      this.setState({ error, failed: true })
    }
  }

  handleSignOut = () => {
    const { navigate, signOut } = this.props
    return signOut().then(() => {
      navigate('/')
    })
  }

  render() {
    if (this.state.failed) {
      return <Redirect to="/" />
    } else if (!this.state.user) {
      return <span>Loading ...</span>
    }
    return (
      <MainLayout>
        <AccountHeader
          title={this.state.user.username}
          balance={this.state.balance}
        />
        <Transaction fetchTransactions={this.props.fetchTransactions} />
      </MainLayout>
    )
  }
}

export default HomeScreen
