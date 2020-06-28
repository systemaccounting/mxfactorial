import React from 'react'
import { shallow } from 'enzyme'
import { Field } from 'react-final-form'
import { FieldArray } from 'react-final-form-arrays'

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

  it('renders type field', () => {
    const wrapper = shallow(<Transaction />)
    expect(wrapper.find(Field).find({ name: 'type' })).toHaveLength(1)
  })

  it('switches transaction type', () => {})

  it('renders transaction items', () => {
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
    const wrapper = shallow(<Transaction />)
    wrapper.setProps({ values: { items: transactions } })
    expect(wrapper.find(FieldArray).find({ name: 'items' })).toHaveLength(1)
  })

  it('calculates total value correctly', () => {
    const transactions = [
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
    const wrapper = shallow(<Transaction />)
    const instance = wrapper.instance()
    wrapper.setProps({ values: { items: transactions } })
    wrapper.update()
    expect(instance.total).toEqual(300)
  })

  it('shows request/debit button based on transactions', () => {
    const transactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2
      }
    ]
    const wrapper = shallow(<Transaction />)
    wrapper.setProps({ values: { items: transactions, type: 'credit' } })

    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(1)
    wrapper.setProps({ values: { items: transactions, type: 'credit' } })
    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(1)
    expect(wrapper.find(Button).find({ ['data-id']: 'debit' })).toHaveLength(0)
    wrapper.setProps({ values: { items: transactions, type: 'debit' } })
    expect(wrapper.find(Button).find({ ['data-id']: 'credit' })).toHaveLength(0)
    expect(wrapper.find(Button).find({ ['data-id']: 'debit' })).toHaveLength(1)
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
})
