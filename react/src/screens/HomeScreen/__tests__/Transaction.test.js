import React from 'react'
import { shallow } from 'enzyme'

import Form from 'components/Form'
import Button from 'components/Button'
import Transaction from '../components/Transaction'

import { fetchTransactions } from 'mock/api'

const USERNAME = 'JoeSmith'
const RECIPIENT = 'Mary'

describe('<Transaction />', () => {
  it('renders', () => {
    const wrapper = shallow(<Transaction />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders typeSwitch', () => {
    const handleSelect = jest.fn()
    const wrapper = shallow(<Transaction />)
    const buttonGroup = wrapper.find('ButtonGroup')
    expect(wrapper.find('TypeSwitch')).toHaveLength(1)
  })

  it('switches transaction type', () => {})

  it('renders transaction items', () => {
    const wrapper = shallow(<Transaction />)
    const transactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2
      },
      {
        uuid: '1235',
        name: 'y',
        price: 25,
        quantity: 2
      }
    ]
    wrapper.setState({ transactions })
    wrapper.update()
    expect(wrapper.find('TransactionItem')).toHaveLength(2)
  })

  it('handles add transaction item', () => {
    const transaction = {
      name: 'x',
      price: 100,
      quantity: 2
    }
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    const scrollSpy = jest.spyOn(instance, 'handleScroll')
    instance.handleAddTransaction(transaction)
    wrapper.update()
    expect(instance.total).toEqual(200)
    expect(wrapper.state('transactions')).toHaveLength(1)
    expect(scrollSpy).toHaveBeenCalled()
  })

  it('shows request/debit button based on transactions', () => {
    const transaction = {
      uuid: '1234',
      name: 'x',
      price: 100,
      quantity: 2
    }
    const wrapper = shallow(<Transaction />)

    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(1)
    wrapper.setState({ transactions: [transaction] })
    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(1)
    expect(wrapper.find(Button).find({ ['data-id']: 'debit' })).toHaveLength(0)
    wrapper.setState({ type: 'debit' })
    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(0)
    expect(wrapper.find(Button).find({ ['data-id']: 'debit' })).toHaveLength(1)
  })

  it('shows and hides form', () => {
    const wrapper = shallow(<Transaction />)
    expect(
      wrapper.find(Button).find({ ['data-id']: 'hide-show-form' })
    ).toHaveLength(0)
    expect(wrapper.find('Form')).toHaveLength(1)
    wrapper.setState({ hideForm: true })
    wrapper.update()
    expect(wrapper.find('Form')).toHaveLength(0)
    expect(
      wrapper.find(Button).find({ ['data-id']: 'hide-show-form' })
    ).toHaveLength(1)
  })

  it('handles edit transaction', () => {
    const wrapper = shallow(<Transaction />)
    wrapper.setState({
      transactions: [
        {
          uuid: '1234',
          name: 'x',
          price: 10,
          quantity: 10
        },
        {
          uuid: '5678',
          name: 'y',
          price: 20,
          quantity: 10
        }
      ]
    })
    const instance = wrapper.instance()
    expect(instance.total).toEqual(300)
    instance.handleEditTransaction('1234')({
      name: 'y',
      price: 20,
      quantity: 1
    })
    expect(instance.total).toEqual(220)
  })

  it('handles switch type', () => {
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    expect(wrapper.state('type')).toEqual('credit')
    instance.handleSwitchType('debit')()
    wrapper.update()
    expect(wrapper.state('type')).toEqual('debit')
  })

  it('handles draft transaction', () => {
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    expect(wrapper.state('draftTransaction')).toEqual(null)
    instance.handleDraftTransaction({ price: 10, quantity: 2 })
    expect(instance.total).toEqual(20)
  })

  it('handles delete transaction', () => {
    const wrapper = shallow(<Transaction />)
    const transactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2
      },
      {
        uuid: '1235',
        name: 'y',
        price: 25,
        quantity: 2
      }
    ]
    wrapper.setState({ transactions })
    wrapper.update()
    const instance = wrapper.instance()
    instance.handleDeleteTransaction('1234')()
    wrapper.update()
    expect(wrapper.state('transactions')).toHaveLength(1)
  })

  it('checks form visibility after transaction deletion', () => {
    const wrapper = shallow(<Transaction />)
    const transactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2
      }
    ]
    wrapper.setState({ transactions })
    wrapper.update()
    const instance = wrapper.instance()

    instance.handleFormClear(true)
    expect(wrapper.state('hideForm')).toEqual(true)

    instance.handleDeleteTransaction('1234')()
    expect(wrapper.state('hideForm')).toEqual(false)
  })

  it('handles recipient change', () => {
    const wrapper = shallow(<Transaction />)
    expect(wrapper.state('recipient')).toEqual('')
    const instance = wrapper.instance()
    instance.handleRecipientChange({ target: { value: 'John Doe' } })
    wrapper.update()
    expect(wrapper.state('recipient')).toEqual('John Doe')
  })

  it('handles scroll', () => {
    const wrapper = shallow(<Transaction />)
    const scrollIntoViewMock = jest.fn()
    const instance = wrapper.instance()
    instance.transactionWrapperRef = {
      current: {
        scrollIntoView: scrollIntoViewMock
      }
    }
    instance.handleScroll()
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })

  it('handles scroll without ref', () => {
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    instance.transactionWrapperRef = {}
    expect(instance.handleScroll()).toEqual(undefined)
  })

  it('handles form clear without transactions', () => {
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    wrapper.setState({ transactions: [] })
    instance.handleFormClear(false)
    expect(wrapper.state('hideForm')).toBe(false)
    instance.handleFormClear(true)
    expect(wrapper.state('hideForm')).toBe(false)

    instance.handleFormClear(false)
    instance.handleShowForm()
    expect(wrapper.state('hideForm')).toBe(false)
  })

  it('handles form clear with transactions', () => {
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    wrapper.setState({ transactions: [{ name: 'x', price: 100, quantity: 2 }] })
    instance.handleFormClear(true)
    expect(wrapper.state('hideForm')).toBe(true)
  })

  it('calls fetchTransacions on componentDidMount', async () => {
    const fetchTransactions = jest.fn()
    const wrapper = shallow(
      <Transaction fetchTransactions={fetchTransactions} />
    )
    const instance = wrapper.instance()
    await instance.componentDidMount()
    expect(fetchTransactions).toHaveBeenCalled()
  })

  it('handles fetchTransacions', async () => {
    const wrapper = shallow(
      <Transaction fetchTransactions={fetchTransactions} />
    )
    const instance = wrapper.instance()
    await instance.getTransactions()
    expect(Object.keys(wrapper.state('transactionHistory')[0])).toEqual(
      expect.arrayContaining([
        'debitor',
        'creditor',
        'debit_approver',
        'credit_approver',
        'name',
        'quantity',
        'price',
        'debitor_transaction_latlng',
        'creditor_transaction_latlng'
      ])
    )
    expect(Object.keys(wrapper.state('transactionHistory')[0])).toHaveLength(23)
  })

  it('updates transactions correctly', async () => {
    const wrapper = shallow(<Transaction username={USERNAME} />)
    const transactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2,
        author: USERNAME,
        creditor: USERNAME,
        debitor: RECIPIENT
      },
      {
        uuid: '1235',
        name: 'y',
        price: 25,
        quantity: 2,
        author: USERNAME,
        creditor: USERNAME,
        debitor: RECIPIENT
      }
    ]
    wrapper.setState({ transactions, recipient: RECIPIENT })
    wrapper.update()
    const instance = wrapper.instance()

    instance.handleDraftTransaction({ name: 'Bread', price: 5, quantity: 5 })
    const draftTransaction = wrapper.state('draftTransaction')
    expect(draftTransaction.creditor).toEqual(USERNAME)
    expect(draftTransaction.debitor).toEqual(RECIPIENT)
    expect(draftTransaction.author).toEqual(USERNAME)
    expect(draftTransaction.creditor_approval_time).toBeUndefined()
    expect(draftTransaction.debitor_approval_time).toBeUndefined()

    instance.handleAddTransaction({ name: 'Bread', price: 5, quantity: 5 })
    wrapper.state('transactions').forEach(transaction => {
      expect(transaction.debitor).toEqual(RECIPIENT)
      expect(transaction.creditor).toEqual(USERNAME)
      expect(transaction.debitor_approval_time).toBeUndefined()
      expect(transaction.creditor_approval_time).toBeUndefined()
    })

    instance.updateTransactions('debit', USERNAME, RECIPIENT)
    wrapper.state('transactions').forEach(transaction => {
      expect(transaction.creditor).toEqual(RECIPIENT)
      expect(transaction.debitor).toEqual(USERNAME)
      expect(transaction.debitor_approval_time).toBeUndefined()
      expect(transaction.creditor_approval_time).toBeUndefined()
    })

    instance.updateTransactions('credit', USERNAME, RECIPIENT)
    wrapper.state('transactions').forEach(transaction => {
      expect(transaction.debitor).toEqual(RECIPIENT)
      expect(transaction.creditor).toEqual(USERNAME)
      expect(transaction.debitor_approval_time).toBeUndefined()
      expect(transaction.creditor_approval_time).toBeUndefined()
    })
  })
})
