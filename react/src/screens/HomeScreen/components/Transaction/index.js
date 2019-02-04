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

  handleSwitchType = type => () => this.setState({ type })

  handleAddTransaction = data => {
    const uuid = v4()
    this.setState(
      state => ({
        ...state,
        transactions: [...state.transactions, { uuid, ...data }]
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
    this.setState(
      state => ({
        ...state,
        rules: [],
        transactions: state.transactions.filter(
          transaction => transaction.uuid !== uuid
        )
      }),
      R.pipe(
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
    const { transactions } = this.state
    if (!transactions.length) {
      return this.setState({ rules: [] })
    }
    this.setState({ hideForm: isClear })
    this.fetchRules()
  }

  handleShowForm = () => this.setState({ hideForm: false })

  handleFormVisibility = () =>
    this.setState(state => ({
      hideForm: state.transactions.length === 0 ? false : state.hideForm
    }))

  handleDraftTransaction = draftTransaction => {
    this.setState({ draftTransaction })
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
        this.setState({ rules, isFetchingRules: false })
      }
    })
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
      <div ref={this.transactionWrapperRef}>
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
            >
              {type === 'credit' ? 'Request' : 'Transact'}
            </Button>
          </div>
        </div>
        {this.rules}
      </div>
    )
  }
}

export default Transaction
