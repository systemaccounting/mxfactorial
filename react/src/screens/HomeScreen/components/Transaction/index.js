import React from 'react'
import cx from 'classnames'
import { v4 } from 'uuid'
import * as R from 'ramda'

import TransactionItem from './TransactionItem'
import Form from 'components/Form'
import Input from 'components/Form/Input'
import LabelWithValue from 'components/LabelWithValue'
import AddIcon from 'icons/AddIcon'

import Button from 'components/Button'
import TypeSwitch from './TypeSwitch'

import transactionSchema from './transactionSchema'
import RemoveButton from './RemoveButton'

import { recalculateRules } from './utils'

class Transaction extends React.Component {
  state = {
    type: 'credit',
    transactions: [],
    draftTransaction: null,
    rules: [],
    transactionHistory: [],
    recipient: '',
    hideForm: false
  }

  transactionWrapperRef = React.createRef()

  componentDidMount() {
    this.getTransactions()
  }

  getTransactions = async () => {
    const { fetchTransactions } = this.props
    if (fetchTransactions) {
      const transactionHistory = await fetchTransactions()
      this.setState({ transactionHistory })
    }
  }

  handleScroll = () => {
    if (this.transactionWrapperRef.current) {
      this.transactionWrapperRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  }

  handleSwitchType = type => () => {
    const { recipient } = this.state
    const { username } = this.props
    this.setState({ type }, () =>
      this.updateTransactions(type, username, recipient)
    )
  }

  handleAddTransaction = data => {
    const { recipient, type } = this.state
    const { username } = this.props
    const uuid = v4()
    this.setState(
      state => ({
        ...state,
        transactions: [
          ...state.transactions,
          {
            uuid,
            ...data,
            author: username,
            debitor: type === 'credit' ? recipient : username,
            creditor: type === 'debit' ? recipient : username
          }
        ]
      }),
      this.handleScroll
    )
  }

  handleEditTransaction = uuid => data => {
    this.setState(state => ({
      transactions: state.transactions.map(transaction => {
        if (transaction.uuid === uuid) {
          return { ...transaction, ...data }
        }
        return transaction
      })
    }))
  }

  handleDeleteTransaction = uuid => () => {
    this.setState(state => {
      const newTransactions = state.transactions.filter(
        transaction => transaction.uuid !== uuid
      )
      const allTransactions = [...newTransactions, state.draftTransaction]
      return {
        rules: recalculateRules(allTransactions, state.rules),
        transactions: newTransactions
      }
    }, R.pipe(this.handleFormVisibility, this.fetchRules))
  }

  handleInputBlur = () => {
    this.fetchRules()
  }

  handleRecipientChange = e => {
    const { type } = this.state
    const { username } = this.state
    this.setState({ recipient: e.target.value })
    this.updateTransactions(type, username, e.target.value)
  }

  handleFormClear = isClear => {
    this.setState(state => {
      const allTransactions = [...state.transactions, state.draftTransaction]
      return {
        rules: recalculateRules(allTransactions, state.rules),
        hideForm: state.transactions.length > 0 && isClear
      }
    }, this.fetchRules)
  }

  handleShowForm = () => this.setState({ hideForm: false })

  handleFormVisibility = () =>
    this.setState(state => ({
      hideForm: state.transactions.length === 0 ? false : state.hideForm
    }))

  handleDraftTransaction = draftTransaction => {
    const { recipient, type } = this.state
    const { username } = this.props
    this.setState({
      draftTransaction: {
        ...draftTransaction,
        author: username,
        debitor: type === 'credit' ? recipient : username,
        creditor: type === 'debit' ? recipient : username
      }
    })
  }

  fetchRules = () => {
    const { draftTransaction, transactions } = this.state
    if (!this.props.fetchRules) {
      return
    }
    this.setState({ isFetchingRules: true })
    let promise = this.props.fetchRules([...transactions, draftTransaction])
    this.fetchRulesRequest = promise
    promise.then(({ data }) => {
      // Resolve only the last request promise
      if (promise === this.fetchRulesRequest) {
        const rules = data.rules.filter(item => item.rule_instance_id)
        rules.map(item => (item.uuid = v4())) // add key prop
        this.setState({ rules, isFetchingRules: false })
      }
    })
  }

  requestTransactions = e => {
    const { form } = this.props
    const { type, rules, transactions, draftTransaction } = this.state
    const transactionItems = [...transactions, draftTransaction, ...rules].map(
      item => {
        // omit __typename to avoid GraphQL errors & client-side uuid
        const { __typename, uuid, ...itemProps } = item
        return { ...itemProps }
      }
    )
    // TODO: remove when migration to final-form is done
    form.change('type', type)
    form.change('items', transactionItems)
    return this.props.handleSubmit(e)
  }

  updateTransactions = (type, username, recipient) => {
    const debitor = type === 'credit' ? recipient : username
    const creditor = type === 'debit' ? recipient : username
    this.setState(prevState => ({
      draftTransaction: {
        ...prevState.draftTransaction,
        author: username,
        creditor,
        debitor
      },
      transactions: prevState.transactions.map(item => {
        // Do not update creditor in rule-generated items
        if (item.rule_instance_id) {
          return {
            ...item,
            debitor
          }
        }
        return {
          ...item,
          debitor,
          creditor
        }
      })
    }))
  }

  get rules() {
    const { rules } = this.state
    if (!rules) {
      return null
    }
    return (
      <div data-id="transaction-rules" style={{ marginTop: 20 }}>
        {rules.map(transaction => (
          <div key={transaction.uuid} data-id="rule-item">
            <TransactionItem
              data-uuid={transaction.uuid}
              transaction={transaction}
              onEdit={this.handleEditTransaction}
              editable={false}
            />
          </div>
        ))}
      </div>
    )
  }

  get total() {
    const { transactions, draftTransaction, rules } = this.state
    return R.pipe(
      R.values,
      R.map(value => {
        if (!value) {
          return 0
        }
        const qty = value.quantity || 1
        return qty * value.price
      }),
      R.reject(isNaN),
      R.sum
    )([...transactions, draftTransaction, ...rules])
  }

  render() {
    const { type, recipient, hideForm, transactions } = this.state
    return (
      <form
        onSubmit={this.requestTransactions}
        ref={this.transactionWrapperRef}
      >
        <Input
          type="text"
          name="recipient"
          value={recipient}
          onChange={this.handleRecipientChange}
          placeholder="Recipient"
        />
        <div className={cx({ updated: !this.state.isFetchingRules })}>
          <LabelWithValue
            name="total"
            label="total"
            value={this.total.toFixed(3)}
          />
        </div>
        <TypeSwitch onSwitch={this.handleSwitchType} active={this.state.type} />
        <div data-id="user-generated-items">
          {transactions.map((transaction, index) => (
            <React.Fragment key={`transaction-${index}`}>
              <RemoveButton
                name="delete-transaction"
                onClick={this.handleDeleteTransaction(transaction.uuid)}
              />
              <div data-id="user-item">
                <TransactionItem
                  data-uuid={transaction.uuid}
                  transaction={transaction}
                  onEdit={this.handleEditTransaction}
                  onInputBlur={this.handleInputBlur}
                />
              </div>
            </React.Fragment>
          ))}
          <div data-id="draft-transaction">
            {!hideForm ? (
              <Form
                namePrefix="transaction-add"
                clearButton={RemoveButton}
                onClear={this.handleFormClear}
                schema={transactionSchema}
                submitLabel={[<AddIcon key="add-icon" />, ' Item']}
                onSubmit={this.handleAddTransaction}
                onValuesUpdate={this.handleDraftTransaction}
                onInputBlur={this.handleInputBlur}
              />
            ) : (
              <Button
                data-id="hide-show-form"
                type="button"
                onClick={this.handleShowForm}
              >
                <AddIcon key="add-icon" /> Item
              </Button>
            )}
            <Button
              data-id={type}
              theme={type === 'credit' ? 'info' : 'success'}
              type="submit"
            >
              {type === 'credit' ? 'Request' : 'Transact'}
            </Button>
          </div>
        </div>
        {this.rules}
      </form>
    )
  }
}

export default Transaction
