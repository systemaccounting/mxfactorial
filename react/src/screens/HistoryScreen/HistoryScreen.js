import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from 'components/MainLayout'
import { Text } from 'components/Typography'

import TransactionSummary from './components/TransactionSummary'

import s from './HistoryScreen.module.css'

class HistoryScreen extends Component {
  state = {
    history: []
  }

  componentDidMount() {
    this.handleFetchHistory()
  }

  handleFetchHistory = async () => {
    const { fetchHistory } = this.props
    if (fetchHistory) {
      const history = await fetchHistory()
      this.setState({ history })
    }
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
        <div className={s.content}>{this.historyList}</div>
      </MainLayout>
    )
  }
}

export default HistoryScreen
