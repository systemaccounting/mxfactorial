import React, { Component } from 'react'
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
    const history = await this.props.fetchHistory()
    this.setState({ history })
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
        <TransactionSummary
          key={timeuuid}
          transaction={historyItem}
          isCredit={isCredit}
        />
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
