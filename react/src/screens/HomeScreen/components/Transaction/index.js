import React from 'react'
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

class Transaction extends React.Component {
  state = {
    type: 'credit',
    transactions: [],
    draftTransaction: null,
    salesTax: [],
    transactionHistory: [],
    recipient: '',
    total: 0,
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

  calculateTotal = () => {
    const { transactions, draftTransaction } = this.state
    const total = R.pipe(
      R.values,
      R.map(value => value && value.quantity * value.price),
      R.reject(isNaN),
      R.sum
    )([...transactions, draftTransaction])
    this.setState({ total })
  }

  handleScroll = () => {
    if (this.transactionWrapperRef.current) {
      this.transactionWrapperRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  }

  handleSwitchType = type => () => this.setState({ type })

  handleAddTransaction = data => {
    const uuid = v4()
    this.setState(
      state => ({
        ...state,
        transactions: [...state.transactions, { uuid, ...data }]
      }),
      R.pipe(
        this.calculateTotal,
        this.handleScroll
      )
    )
  }

  handleEditTransaction = uuid => data => {
    this.setState(
      state => ({
        ...state,
        transactions: state.transactions.map(transaction => {
          if (transaction.uuid === uuid) {
            return { ...transaction, ...data }
          }
          return transaction
        })
      }),
      this.calculateTotal
    )
  }

  handleDeleteTransaction = uuid => () => {
    this.setState(
      state => ({
        ...state,
        transactions: state.transactions.filter(
          transaction => transaction.uuid !== uuid
        )
      }),
      R.pipe(
        this.calculateTotal,
        this.handleFormVisibility,
        this.fetchRules
      )
    )
  }

  handleInputBlur = () => {
    this.fetchRules()
  }

  handleRecipientChange = e => this.setState({ recipient: e.target.value })

  handleFormClear = isClear => {
    if (isClear && this.state.transactions.length) {
      this.setState({ hideForm: true })
    }
    setTimeout(this.fetchRules)
  }

  handleShowForm = () => this.setState({ hideForm: false })

  handleFormVisibility = () =>
    this.setState(state => ({
      hideForm: state.transactions.length === 0 ? false : state.hideForm
    }))

  handleDraftTransaction = draftTransaction => {
    this.setState({ draftTransaction }, this.calculateTotal)
  }

  fetchRules = () => {
    const { draftTransaction, transactions } = this.state
    if (!this.props.fetchRules) {
      return
    }
    this.props
      .fetchRules([...transactions, draftTransaction])
      .then(({ data }) => {
        const salesTax = data.rules.filter(item => item.rule_instance_id)
        this.setState({ salesTax })
      })
  }

  get salesTax() {
    const { salesTax } = this.state
    if (!salesTax) {
      return null
    }
    return (
      <div style={{ marginTop: 20 }}>
        {salesTax.map(transaction => (
          <TransactionItem
            key={transaction.uuid}
            data-uuid={transaction.uuid}
            transaction={transaction}
            onEdit={this.handleEditTransaction}
            editable={false}
          />
        ))}
      </div>
    )
  }

  render() {
    const { total, type, recipient, hideForm, transactions } = this.state
    return (
      <div ref={this.transactionWrapperRef}>
        <Input
          type="text"
          name="recipient"
          value={recipient}
          onChange={this.handleRecipientChange}
          placeholder="Recipient"
        />
        <LabelWithValue name="total" label="total" value={total} />
        <TypeSwitch onSwitch={this.handleSwitchType} active={this.state.type} />
        <div>
          {transactions.map((transaction, index) => (
            <React.Fragment key={`transaction-${index}`}>
              <RemoveButton
                name="delete-transaction"
                onClick={this.handleDeleteTransaction(transaction.uuid)}
              />
              <TransactionItem
                data-uuid={transaction.uuid}
                transaction={transaction}
                onEdit={this.handleEditTransaction}
                onInputBlur={this.handleInputBlur}
              />
            </React.Fragment>
          ))}
          {this.salesTax}
        </div>
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
        <React.Fragment>
          <Button data-id={type} theme={type === 'credit' ? 'info' : 'success'}>
            {type === 'credit' ? 'Request' : 'Transact'}
          </Button>
        </React.Fragment>
      </div>
    )
  }
}

export default Transaction
