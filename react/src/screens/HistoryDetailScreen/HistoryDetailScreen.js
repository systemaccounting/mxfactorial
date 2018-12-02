import React, { Component } from 'react'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import Button from 'components/Button'
import { Text, Small, P } from 'components/Typography'
import { dateString, maxDate } from 'utils/date'
import { formatCurrency } from 'utils/currency'
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
    const value = isCredit ? total * -1 : total
    return formatCurrency(value)
  }

  get transactionTime() {
    const {
      transaction: { cr_time, db_time }
    } = this.state
    return dateString(
      maxDate([cr_time, db_time]),
      'dddd, MMMM D, YYYY @ h:mm A [GMT]Z'
    )
  }

  get items() {
    const { transaction } = this.state
    return (
      <div className={s.items}>
        <Paper data-id="transactionItemIndicator">
          <P textAlign="center" fontWeight="bold" variant="medium">
            {parseInt(transaction.quantity, 10)} x {}
            {formatCurrency(transaction.price)}
          </P>
          <P textAlign="center" fontWeight="bold" variant="medium">
            {transaction.name}
          </P>
        </Paper>
      </div>
    )
  }

  get content() {
    const { transaction, isCredit } = this.state
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
            {isCredit ? transaction.debitor : transaction.creditor}
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
          <Text
            data-id="transactionTimeIndicator"
            fontWeight="bold"
            textAlign="center"
          >
            {this.transactionTime}
          </Text>
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
        <p className={s.label}>Rule Instance IDs</p>
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
            {formatCurrency(1000)}
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
            {formatCurrency(976)}
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
