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
    console.log(user)
    if (!history.length) {
      return null
    }
    return history.map(historyItem => {
      const {
        timeuuid,
        creditor,
        creditor_approval_time,
        debitor,
        price,
        quantity
      } = historyItem
      const isCredit = creditor === user.username
      const amount = (price * quantity).toLocaleString()
      return (
        <TransactionSummary
          key={timeuuid}
          createdAt={creditor_approval_time}
          partner={isCredit ? debitor : creditor}
          amount={isCredit ? `- ${amount}` : amount}
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
        <div className={s.content}>
          {this.historyList}
        </div>
      </MainLayout>
    )
  }
}

export default HistoryScreen
