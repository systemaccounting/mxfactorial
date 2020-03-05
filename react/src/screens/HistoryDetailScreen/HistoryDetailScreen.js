import React, { Component } from 'react'
import Paper from 'components/Paper'
import Button from 'components/Button'
import { Text, Small, P } from 'components/Typography'
import { dateString } from 'utils/date'
import { formatCurrency } from 'utils/currency'
import HistoryDetailHeader from './components/HistoryDetailHeader'

import { labels } from './constants'

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
    const { transactionTotal, isCredit } = this.props
    const value = isCredit ? transactionTotal * -1 : transactionTotal
    return formatCurrency(value)
  }

  get transactionTime() {
    const { transactionTime } = this.props
    return dateString(transactionTime, 'dddd, MMMM D, YYYY @ h:mm A [GMT]Z')
  }

  get items() {
    const { transactionItems } = this.props
    return (
      <div className={s.items}>
        {transactionItems.map(item => (
          <Paper key={item.id} data-id="transactionItemIndicator">
            <P textAlign="center" fontWeight="bold" variant="medium">
              {parseInt(item.quantity, 10)} x {}
              {formatCurrency(item.price)}
            </P>
            <P textAlign="center" fontWeight="bold" variant="medium">
              {item.name}
            </P>
          </Paper>
        ))}
      </div>
    )
  }

  get content() {
    const { transactionAccount, transactionId, ruleInstanceIds } = this.props
    if (!transactionAccount) {
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
            {transactionAccount}
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
        <p className={s.label} data-id="transactionIdLabel">
          {labels.transactionIdLabel}
        </p>
        <Paper>
          <Small
            textAlign="center"
            fontWeight="bold"
            data-id="transactionIdIndicator"
          >
            {transactionId}
          </Small>
        </Paper>
        <p className={s.label} data-id="ruleInstanceIdsLabel">
          {labels.ruleInstanceIdsLabel}
        </p>
        {ruleInstanceIds.map(rule => (
          <Paper key={rule}>
            <Small
              textAlign="center"
              fontWeight="bold"
              data-id="ruleInstanceIdsIndicator"
            >
              {rule}
            </Small>
          </Paper>
        ))}
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
      <>
        <HistoryDetailHeader />
        {this.content}
      </>
    )
  }
}

export default HistoryDetailScreen
