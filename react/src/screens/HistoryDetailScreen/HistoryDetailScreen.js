import React, { Component } from 'react'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import Button from 'components/Button'
import { Text, Small, P } from 'components/Typography'
import { fromNow } from 'utils/date'
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

  disputeTransaction = () => {
    const { transaction } = this.state
    console.info('Dispute transaction: ', transaction)
  }

  get total() {
    const { transaction, isCredit } = this.state
    const total = transaction.price * transaction.quantity
    const localized = total.toLocaleString()
    return isCredit ? `- ${localized}` : localized
  }

  get transactionTime() {
    const {
      transaction: { creditor_approval_time, debitor_approval_time }
    } = this.state
    return fromNow(creditor_approval_time || debitor_approval_time)
  }

  get items() {
    const { transaction } = this.state
    return (
      <div className={s.items}>
        <Paper data-id="transactionItemIndicator">
          <P textAlign="center" fontWeight="bold" variant="medium">
            {parseInt(transaction.quantity, 10)} x {transaction.price}
          </P>
          <P textAlign="center" fontWeight="bold" variant="medium">
            {transaction.name}
          </P>
        </Paper>
      </div>
    )
  }

  get content() {
    const { transaction } = this.state
    if (!transaction) {
      return null
    }
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
        <Paper>
          <P fontWeight="bold">Time of transaction</P>
          <P data-id="transactionTimeIndicator" textAlign="right">
            {this.transactionTime}
          </P>
        </Paper>
        {this.items}
        <p className={s.label}>Transaction ID</p>
        <Paper>
          <Small
            textAlign="center"
            fontWeight="bold"
            data-id="transactionIdIndicator"
          >
            {transaction.transaction_id}
          </Small>
        </Paper>
        <p className={s.label}>Rule Instance ID</p>
        <Paper>
          <Small
            textAlign="center"
            fontWeight="bold"
            data-id="ruleInstanceIdsIndicator"
          >
            {transaction.rule_instance_id}
          </Small>
        </Paper>
        <p className={s.label}>Pre-transaction balance</p>
        <Paper>
          <Text
            textAlign="right"
            variant="medium"
            fontWeight="bold"
            data-id="preTransactionBalanceIndicator"
          >
            1 000,00
          </Text>
        </Paper>
        <p className={s.label}>Post-transaction balance</p>
        <Paper>
          <Text
            textAlign="right"
            variant="medium"
            fontWeight="bold"
            data-id="postTransactionBalanceIndicator"
          >
            976,00
          </Text>
        </Paper>
        {this.actions}
      </div>
    )
  }

  get actions() {
    return (
      <div className={s.actions}>
        <Button
          onClick={this.disputeTransaction}
          icon="balance-scale"
          data-id="disputeTransactionButton"
        >
          Report
        </Button>
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
