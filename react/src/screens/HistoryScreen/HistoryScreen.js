import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import { Text, P } from 'components/Typography'

import TransactionSummary from './components/TransactionSummary'

import s from './HistoryScreen.module.css'

class HistoryScreen extends Component {
  state = {
    history: [],
    balance: 0
  }

  componentDidMount() {
    this.handleFetchHistory()
    this.handleFetchBalance()
  }

  handleFetchHistory = async () => {
    const { fetchHistory } = this.props
    if (fetchHistory) {
      const history = await fetchHistory()
      this.setState({ history })
    }
  }

  handleFetchBalance = async () => {
    const { fetchBalance } = this.props
    if (fetchBalance) {
      const balance = await fetchBalance()
      this.setState({ balance })
    }
  }

  get accountBalance() {
    const { user } = this.props
    return (
      <div
        className={s.accountBalance}
        data-id="currentAccountBalanceIndicator"
      >
        <Paper>
          <P fontWeight="bold" textAlign="center">
            {`${user.username} balance`}
          </P>
          <Text
            variant="large"
            textAlign="center"
            fontWeight="bold"
            style={{ marginTop: 4 }}
          >
            {this.state.balance.toLocaleString()}
          </Text>
        </Paper>
      </div>
    )
  }

  get historyList() {
    const { user } = this.props
    const { history } = this.state
    if (!history.length) {
      return null
    }
    return history.map(historyItem => {
      const { timeuuid, creditor } = historyItem
      const isCredit = creditor === user.username
      return (
        <Link key={timeuuid} to={`/history/${timeuuid}`}>
          <TransactionSummary transaction={historyItem} isCredit={isCredit} />
        </Link>
      )
    })
  }

  render() {
    return (
      <MainLayout>
        <Text
          variant="medium"
          fontWeight="bold"
          textAlign="center"
          style={{ color: '#efefef' }}
        >
          History
        </Text>
        <div className={s.content}>
          {this.accountBalance}
          {this.historyList}
        </div>
      </MainLayout>
    )
  }
}

export default HistoryScreen
