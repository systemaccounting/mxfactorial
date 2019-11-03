import React from 'react'

export default function withGroupedTransactions(WrappedComponent) {
  return class extends React.Component {
    getTransationIds(transactions) {
      return transactions.map(item => item.transaction_id)
    }

    getUniqueTransactionIds(ids) {
      return [...new Set(ids)]
    }

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

    getContraAccounts(currentAccount, transactionsGroupedById) {
      let contraAccounts = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue
          }
          let isCredit = item.creditor === currentAccount
          let contraAccount = isCredit ? item.debitor : item.creditor
          contraAccounts.push(contraAccount)
          break
        }
      }
      return contraAccounts
    }

    getTransactionTotals(transactionsGroupedById) {
      let transactionTotals = []
      for (let grouped of transactionsGroupedById) {
        let total = grouped.reduce((acc, item) => {
          let itemPrice = Number.parseFloat(item.price)
          let itemQuantity = Number.parseFloat(item.quantity)
          let perItemTotal = itemPrice * itemQuantity
          return acc + perItemTotal
        }, 0)
        transactionTotals.push(total)
      }
      return transactionTotals
    }

    getApprovalTimes(transactionsGroupedById) {
      let approvalTimes = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
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

    getAuthors(transactionsGroupedById) {
      let authors = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue
          }
          authors.push(item.author)
          break
        }
      }
      return authors
    }

    testForCreditorInTransactionItem(currentAccount, transactionsGroupedById) {
      let isCreditor = []
      for (let grouped of transactionsGroupedById) {
        for (let item of grouped) {
          if (item.rule_instance_id) {
            continue
          }
          isCreditor.push(item.creditor === currentAccount)
          break
        }
      }
      return isCreditor
    }

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
      let transactionIds = this.getTransationIds(transactions)
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
