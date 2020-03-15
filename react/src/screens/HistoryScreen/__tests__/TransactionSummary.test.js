import React from 'react'
import { shallow } from 'enzyme'
import { fromNow, maxDate } from 'utils/date'
import TransactionSummary from '../components/TransactionSummary'
import { formatCurrency } from 'utils/currency'

const transaction = {
  time: '2020-03-15 14:29:30.122 +00:00',
  isCreditor: true,
  transaction_id: '61a9d080-66c9-11ea-9417-aff0258a8ec4',
  author: 'TEST_ACCOUNT_01',
  contraAccount: 'TEST_ACCOUNT_02',
  total: '533.235',
  transactions: [
    {
      id: '5173',
      name: 'milk',
      quantity: '2',
      price: '56.823',
      author: 'TEST_ACCOUNT_01',
      debitor: 'TEST_ACCOUNT_02',
      creditor: 'TEST_ACCOUNT_01',
      creditor_approval_time: '2020-03-15 14:29:30.122 +00:00',
      debitor_approval_time: '2020-03-15 16:26:14.882 +00:00',
      expiration_time: null,
      transaction_id: '61a9d080-66c9-11ea-9417-aff0258a8ec4',
      rule_instance_id: null,
      __typename: 'Transaction'
    },
    {
      id: '5171',
      name: '',
      quantity: '',
      price: '',
      author: 'TEST_ACCOUNT_01',
      debitor: 'TEST_ACCOUNT_02',
      creditor: 'TEST_ACCOUNT_01',
      creditor_approval_time: '2020-03-15 14:29:30.122 +00:00',
      debitor_approval_time: '2020-03-15 16:26:14.882 +00:00',
      expiration_time: null,
      transaction_id: '61a9d080-66c9-11ea-9417-aff0258a8ec4',
      rule_instance_id: null
    },
    {
      id: '5170',
      name: 'bread',
      quantity: '4',
      price: '93.890',
      author: 'TEST_ACCOUNT_01',
      debitor: 'TEST_ACCOUNT_02',
      creditor: 'TEST_ACCOUNT_01',
      creditor_approval_time: '2020-03-15 14:29:30.122 +00:00',
      debitor_approval_time: '2020-03-15 16:26:14.882 +00:00',
      expiration_time: null,
      transaction_id: '61a9d080-66c9-11ea-9417-aff0258a8ec4',
      rule_instance_id: null
    },
    {
      id: '5172',
      name: '9% state sales tax',
      quantity: '1',
      price: '44.029',
      author: 'TEST_ACCOUNT_01',
      debitor: 'TEST_ACCOUNT_02',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: '2020-03-15 14:29:30.120 +00:00',
      debitor_approval_time: '2020-03-15 16:26:14.882 +00:00',
      expiration_time: null,
      transaction_id: '61a9d080-66c9-11ea-9417-aff0258a8ec4',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    }
  ]
}

const selectors = {
  transactionAmount: '[data-id="transactionAmount"]',
  transactionPartner: '[data-id="transactionPartner"]',
  transactionTime: '[data-id="transactionTime"]'
}

const props = {
  transaction
}

describe('<TransactionSummary />', () => {
  it('renders', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('contains transaction amount', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    expect(amountEl.exists()).toBeTruthy()
  })

  it('contains transaction time', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const timeEl = wrapper.find(selectors.transactionTime)
    expect(timeEl.exists()).toBeTruthy()
    expect(timeEl.text()).toEqual(fromNow(transaction.time))
  })

  it('contains transaction partner', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const partnerEl = wrapper.find(selectors.transactionPartner)
    expect(partnerEl.exists()).toBeTruthy()
  })

  it('displays negative direction of transaction', () => {
    const wrapper = shallow(<TransactionSummary {...props} isCredit />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    const total = transaction.quantity * transaction.price
    const expectedValue = `- ${formatCurrency(transaction.total)}`
    expect(amountEl.text()).toEqual(expectedValue)
  })

  it('displays positive direction of transaction', () => {
    const debitTransaction = {
      ...transaction,
      isCreditor: false
    }
    const wrapper = shallow(
      <TransactionSummary transaction={debitTransaction} />
    )
    const amountEl = wrapper.find(selectors.transactionAmount)
    const total = transaction.quantity * transaction.price
    const expectedValue = `${formatCurrency(transaction.total)}`
    expect(amountEl.text()).toEqual(expectedValue)
  })
})
