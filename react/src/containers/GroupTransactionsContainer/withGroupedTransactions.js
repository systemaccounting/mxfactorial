import React from 'react'
import PropTypes from 'prop-types'

/*
api returns a set of items (milk, bread, tax)
sharing a transaction_id as a "transaction".
component required to group items as transactions
before display
*/

export default function withGroupedTransactions(WrappedComponent) {
  return class extends React.Component {
    static propTypes = {
      sortedTransactions: PropTypes.array
    }
    // init array with transaction_id of each transaction
    getTransactionIds(transactions) {
      return transactions.map(item => item.transaction_id)
    }
    // dedupe transaction_id array for grouping
    getUniqueTransactionIds(transactionIds) {
      return [...new Set(transactionIds)]
    }
    // group transactions with same transaction_id
    // into nested array entries
    groupTransactionsById(uniqueIds, transactions) {
      let transactionsGroupedById = []
      for (let id of uniqueIds) {
        let groupedById = []
        for (let item of transactions) {
          if (item.transaction_id === id) {
            groupedById.push(item)
          }
        }
        transactionsGroupedById.push(groupedById)
      }
      return transactionsGroupedById
    }
    // iterate through each item of grouped transactions
    // to identify the other account in the transaction (contra account).
    // do not consider contra account of any rule generated items
    // (rule_instance_id value) value present
    getContraAccounts(currentAccount, transactionsGroupedById) {
      let contraAccounts = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue // do not consider rule generated items
          }
          let isCredit = item.creditor === currentAccount
          let contraAccount = isCredit ? item.debitor : item.creditor
          contraAccounts.push(contraAccount)
          break // no need to continue loop
        }
      }
      return contraAccounts
    }
    // sum value of transaction items grouped by transaction_id
    getTransactionTotals(transactionsGroupedById) {
      let transactionTotals = []
      for (let grouped of transactionsGroupedById) {
        let total = grouped.reduce((acc, item) => {
          let itemPrice = Number.parseFloat(item.price || 0) // avoid NaNs in test data
          let itemQuantity = Number.parseFloat(item.quantity || 0)
          let perItemTotal = itemPrice * itemQuantity
          return acc + perItemTotal
        }, 0)
        let roundedTotal = Math.round(total * 1000) / 1000
        let threeDecimalTotal = roundedTotal.toFixed(3)
        transactionTotals.push(threeDecimalTotal)
      }
      return transactionTotals
    }
    // get time transaction request created from creditor or debitor
    getApprovalTimes(transactionsGroupedById) {
      let approvalTimes = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue
          }
          if (item.creditor_approval_time) {
            approvalTimes.push(item.creditor_approval_time)
            continue
          } else if (item.debitor_approval_time) {
            approvalTimes.push(item.debitor_approval_time)
            continue
          }
        }
      }
      return approvalTimes
    }
    // get authors
    getAuthors(transactionsGroupedById) {
      let authors = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue // do not consider rule generated items
          }
          authors.push(item.author)
          break // no need to continue loop
        }
      }
      return authors
    }
    // discover if current account is creditor in transaction.
    // do not consider rule generated items
    testForCreditorInTransactionItem(currentAccount, transactionsGroupedById) {
      let isCreditor = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue // do not consider rule generated items
          }
          isCreditor.push(item.creditor === currentAccount)
          break // no need to continue loop
        }
      }
      return isCreditor
    }
    // create object for each set of transactions with
    // keys describing group
    addKeysToGroupedTransactions(
      transactionsGroupedById,
      approvalTimes,
      isCreditorList,
      uniqueTransactionIds,
      authors,
      contraAccounts,
      transactionTotals
    ) {
      let groupedTransactionsWithKeys = []
      for (let i = 0; i < transactionsGroupedById.length; i++) {
        groupedTransactionsWithKeys.push({
          time: approvalTimes[i],
          isCreditor: isCreditorList[i],
          transaction_id: uniqueTransactionIds[i],
          author: authors[i],
          contraAccount: contraAccounts[i],
          total: transactionTotals[i],
          transactions: transactionsGroupedById[i]
        })
      }
      return groupedTransactionsWithKeys
    }
    // sort grouped transactions array
    getTimeSortedTransactions(groupedTransactionsWithKeys) {
      return groupedTransactionsWithKeys.sort((a, b) =>
        a.time > b.time ? -1 : 1
      )
    }

    render() {
      let {
        user: { username },
        transactions
      } = this.props
      let transactionIds = this.getTransactionIds(transactions)
      let uniqueIds = this.getUniqueTransactionIds(transactionIds)
      let transactionsGroupedById = this.groupTransactionsById(
        uniqueIds,
        transactions
      )
      let contraAccounts = this.getContraAccounts(
        username,
        transactionsGroupedById
      )
      let transactionTotals = this.getTransactionTotals(transactionsGroupedById)
      let approvalTimes = this.getApprovalTimes(transactionsGroupedById)
      let authors = this.getAuthors(transactionsGroupedById)
      let isCreditorList = this.testForCreditorInTransactionItem(
        username,
        transactionsGroupedById
      )
      let groupedTransactionsWithKeys = this.addKeysToGroupedTransactions(
        transactionsGroupedById,
        approvalTimes,
        isCreditorList,
        uniqueIds,
        authors,
        contraAccounts,
        transactionTotals
      )
      let sortedTransactions = this.getTimeSortedTransactions(
        groupedTransactionsWithKeys
      )
      return (
        <WrappedComponent
          {...this.props}
          groupedTransactions={sortedTransactions}
        />
      )
    }
  }
}
