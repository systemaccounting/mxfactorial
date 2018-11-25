import React, { Component } from 'react'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import { Text } from 'components/Typography'
import HistoryDetailHeader from './components/HistoryDetailHeader'

import s from './HistoryDetailScreen.module.css'

class HistoryDetailScreen extends Component {
  state = {
    transaction: null,
    isCredit: false
  }

  componentDidMount() {
    this.handleFetchHistoryItem()
  }

  handleFetchHistoryItem = async () => {
    const {
      fetchHistoryItem,
      user,
      match: { uuid }
    } = this.props
    if (fetchHistoryItem) {
      const transaction = await fetchHistoryItem(uuid)
      this.setState({
        transaction,
        isCredit: transaction.creditor === user.username
      })
    }
  }

  get total() {
    const { transaction, isCredit } = this.state
    if (!transaction) {
      return 0
    }
    const total = transaction.price * transaction.quantity
    const localized = total.toLocaleString()
    return isCredit ? `- ${localized}` : localized
  }

  get content() {
    return (
      <div className={s.content}>
        <Paper>
          <Text
            variant="large"
            textAlign="center"
            fontWeight="bold"
            data-id="contraAccountIndicator"
          >
            Dannys Market
          </Text>
        </Paper>
        <Paper>
          <Text
            variant="large"
            textAlign="center"
            fontWeight="bold"
            data-id="sumTransactionItemValueIndicator"
          >
            {this.total}
          </Text>
        </Paper>
      </div>
    )
  }

  render() {
    return (
      <MainLayout>
        <HistoryDetailHeader />
        {this.content}
      </MainLayout>
    )
  }
}

export default HistoryDetailScreen
