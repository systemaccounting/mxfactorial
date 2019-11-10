import React from 'react'
import { shallow } from 'enzyme'

import withGroupedTransactions from './withGroupedTransactions'

describe('withGroupedTransactions', () => {
  it('renders', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )

    expect(wrapper.exists()).toBeTruthy()
  })

  it('getTransactionIds returns transaction ids', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getTransactionIds(testTransactions)
    const expected = testTransactions.map(group => group.transaction_id)
    expect(result).toEqual(expected)
  })

  it('getUniqueTransactionIds returns dedupes transaction ids', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const transactionIds = testTransactions.map(group => group.transaction_id)
    const result = instance.getUniqueTransactionIds(transactionIds)
    const expected = [
      '92ea2f30-00f5-11ea-a90a-478c7457b385',
      '6330f560-00f2-11ea-90a1-9525e04b53cd',
      '8ee69a90-00f0-11ea-9308-2f403f06dc39'
    ]
    expect(result).toEqual(expected)
  })

  it('groupTransactionsById returns grouped transactions', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const uniqueTransactionIds = [
      '92ea2f30-00f5-11ea-a90a-478c7457b385',
      '6330f560-00f2-11ea-90a1-9525e04b53cd',
      '8ee69a90-00f0-11ea-9308-2f403f06dc39'
    ]
    const result = instance.groupTransactionsById(
      uniqueTransactionIds,
      testTransactions
    )
    expect(result).toEqual(transactionsGroupedById)
  })

  it('getContraAccounts returns contraAccounts', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getContraAccounts(
      'testaccount1',
      transactionsGroupedById
    )
    const expected = ['testaccount2', 'testaccount8', 'testaccount5']
    expect(result).toEqual(expected)
  })

  it('getTransactionTotals returns transaction totals', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getTransactionTotals(transactionsGroupedById)
    const expected = ['8.720', '16.350', '4.360']
    expect(result).toEqual(expected)
  })

  it('getApprovalTimes returns transaction request times', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getApprovalTimes(transactionsGroupedById)
    const expected = [
      '2019-11-07 00:28:53.304 +00:00',
      '2019-11-07 00:06:04.785 +00:00',
      '2019-11-06 23:52:57.787 +00:00'
    ]
    expect(result).toEqual(expected)
  })

  it('getAuthors returns transaction authors', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getAuthors(transactionsGroupedById)
    const expected = ['testaccount1', 'testaccount8', 'testaccount5']

    expect(result).toEqual(expected)
  })

  it('testForCreditorInTransactionItem returns transaction roles', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.testForCreditorInTransactionItem(
      'testaccount1',
      transactionsGroupedById
    )
    const expected = [true, false, true]

    expect(result).toEqual(expected)
  })

  it('addKeysToGroupedTransactions returns object with transaction properties', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const approvalTimes = [
      '2019-11-07 00:28:53.304 +00:00',
      '2019-11-07 00:06:04.785 +00:00',
      '2019-11-06 23:52:57.787 +00:00'
    ]
    const isCreditorList = [true, false, true]
    const uniqueTransactionIds = [
      '92ea2f30-00f5-11ea-a90a-478c7457b385',
      '6330f560-00f2-11ea-90a1-9525e04b53cd',
      '8ee69a90-00f0-11ea-9308-2f403f06dc39'
    ]
    const authors = ['testaccount1', 'testaccount8', 'testaccount5']
    const contraAccounts = ['testaccount2', 'testaccount8', 'testaccount5']
    const transactionTotals = ['8.720', '16.350', '4.360']
    const result = instance.addKeysToGroupedTransactions(
      transactionsGroupedById,
      approvalTimes,
      isCreditorList,
      uniqueTransactionIds,
      authors,
      contraAccounts,
      transactionTotals
    )

    expect(result).toEqual(transactionsGroupedByIdWithKeys)
  })

  it('getTimeSortedTransactions returns sorted, grouped transactions', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const instance = wrapper.instance()
    const result = instance.getTimeSortedTransactions(
      transactionsGroupedByIdWithKeys
    )

    expect(result).toEqual(sortedTransactionsGroupedByIdWithKeys)
  })

  it('returns 3 grouped transactions', async () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    expect(props.groupedTransactions).toHaveLength(3)
  })

  it('contraAccount included', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const testContraAccounts = props.groupedTransactions.map(
      group => group.contraAccount
    )
    const expected = ['testaccount2', 'testaccount8', 'testaccount5']

    expect(testContraAccounts).toEqual(expected)
  })

  it('totals included', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const totals = props.groupedTransactions.map(group => group.total)
    const expectedTotals = ['8.720', '16.350', '4.360']

    expect(totals).toEqual(expectedTotals)
  })

  it('request times in descending sequence included', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const requestTimes = props.groupedTransactions.map(group => group.time)
    const expected = [
      '2019-11-07 00:28:53.304 +00:00',
      '2019-11-07 00:06:04.785 +00:00',
      '2019-11-06 23:52:57.787 +00:00'
    ]

    expect(requestTimes).toEqual(expected)
  })

  it('authors included', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const authors = props.groupedTransactions.map(group => group.author)
    const expected = ['testaccount1', 'testaccount8', 'testaccount5']

    expect(authors).toEqual(expected)
  })

  it('transaction roles included', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const roles = props.groupedTransactions.map(group => group.isCreditor)
    const expectedTotals = [true, false, true]

    expect(roles).toEqual(expectedTotals)
  })

  it('keys in grouped transactions', () => {
    const MockScreen = () => <div />
    const ComponentWithGroupedTransactions = withGroupedTransactions(MockScreen)
    const wrapper = shallow(
      <ComponentWithGroupedTransactions
        user={{
          username: 'testaccount1'
        }}
        transactions={testTransactions}
      />
    )
    const props = wrapper.props()
    const sortResults = (a, b) => (a > b ? -1 : 1)
    const keys = Object.keys(props.groupedTransactions[0])
    const expected = [
      'author',
      'contraAccount',
      'isCreditor',
      'time',
      'total',
      'transaction_id',
      'transactions'
    ]
    const keysSorted = keys.sort(sortResults)
    const expectedSorted = expected.sort(sortResults)

    expect(keysSorted).toEqual(expectedSorted)
  })
})

const testTransactions = [
  {
    id: '319',
    name: '9% state sales tax',
    quantity: '1',
    price: '0.720',
    author: 'testaccount1',
    debitor: 'testaccount2',
    creditor: 'StateOfCalifornia',
    creditor_approval_time: null,
    debitor_approval_time: null,
    expiration_time: null,
    transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
    rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  },
  {
    id: '318',
    name: 'milk',
    quantity: '2',
    price: '4.00',
    author: 'testaccount1',
    debitor: 'testaccount2',
    creditor: 'testaccount1',
    creditor_approval_time: '2019-11-07 00:28:53.304 +00:00',
    debitor_approval_time: null,
    expiration_time: null,
    transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
    rule_instance_id: null
  },
  {
    id: '317',
    name: '9% state sales tax',
    quantity: '1',
    price: '1.350',
    author: 'testaccount8',
    debitor: 'testaccount1',
    creditor: 'StateOfCalifornia',
    creditor_approval_time: null,
    debitor_approval_time: null,
    expiration_time: null,
    transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
    rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  },
  {
    id: '316',
    name: 'honey',
    quantity: '5.00',
    price: '3',
    author: 'testaccount8',
    debitor: 'testaccount1',
    creditor: 'testaccount8',
    creditor_approval_time: '2019-11-07 00:06:04.785 +00:00',
    debitor_approval_time: null,
    expiration_time: null,
    transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
    rule_instance_id: null
  },
  {
    id: '315',
    name: '9% state sales tax',
    quantity: '1',
    price: '0.360',
    author: 'testaccount5',
    debitor: 'testaccount5',
    creditor: 'StateOfCalifornia',
    creditor_approval_time: null,
    debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
    expiration_time: null,
    transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
    rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  },
  {
    id: '314',
    name: 'tea',
    quantity: '2',
    price: '2.00',
    author: 'testaccount5',
    debitor: 'testaccount5',
    creditor: 'testaccount1',
    creditor_approval_time: null,
    debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
    expiration_time: null,
    transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
    rule_instance_id: null
  }
]

const transactionsGroupedById = [
  [
    {
      id: '319',
      name: '9% state sales tax',
      quantity: '1',
      price: '0.720',
      author: 'testaccount1',
      debitor: 'testaccount2',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: null,
      debitor_approval_time: null,
      expiration_time: null,
      transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    },
    {
      id: '318',
      name: 'milk',
      quantity: '2',
      price: '4.00',
      author: 'testaccount1',
      debitor: 'testaccount2',
      creditor: 'testaccount1',
      creditor_approval_time: '2019-11-07 00:28:53.304 +00:00',
      debitor_approval_time: null,
      expiration_time: null,
      transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
      rule_instance_id: null
    }
  ],
  [
    {
      id: '317',
      name: '9% state sales tax',
      quantity: '1',
      price: '1.350',
      author: 'testaccount8',
      debitor: 'testaccount1',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: null,
      debitor_approval_time: null,
      expiration_time: null,
      transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    },
    {
      id: '316',
      name: 'honey',
      quantity: '5.00',
      price: '3',
      author: 'testaccount8',
      debitor: 'testaccount1',
      creditor: 'testaccount8',
      creditor_approval_time: '2019-11-07 00:06:04.785 +00:00',
      debitor_approval_time: null,
      expiration_time: null,
      transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
      rule_instance_id: null
    }
  ],
  [
    {
      id: '315',
      name: '9% state sales tax',
      quantity: '1',
      price: '0.360',
      author: 'testaccount5',
      debitor: 'testaccount5',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: null,
      debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
      expiration_time: null,
      transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    },
    {
      id: '314',
      name: 'tea',
      quantity: '2',
      price: '2.00',
      author: 'testaccount5',
      debitor: 'testaccount5',
      creditor: 'testaccount1',
      creditor_approval_time: null,
      debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
      expiration_time: null,
      transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
      rule_instance_id: null
    }
  ]
]

const transactionsGroupedByIdWithKeys = [
  {
    time: '2019-11-07 00:28:53.304 +00:00',
    isCreditor: true,
    transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
    author: 'testaccount1',
    contraAccount: 'testaccount2',
    total: '8.720',
    transactions: [
      {
        id: '319',
        name: '9% state sales tax',
        quantity: '1',
        price: '0.720',
        author: 'testaccount1',
        debitor: 'testaccount2',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '318',
        name: 'milk',
        quantity: '2',
        price: '4.00',
        author: 'testaccount1',
        debitor: 'testaccount2',
        creditor: 'testaccount1',
        creditor_approval_time: '2019-11-07 00:28:53.304 +00:00',
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
        rule_instance_id: null
      }
    ]
  },
  {
    time: '2019-11-07 00:06:04.785 +00:00',
    isCreditor: false,
    transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
    author: 'testaccount8',
    contraAccount: 'testaccount8',
    total: '16.350',
    transactions: [
      {
        id: '317',
        name: '9% state sales tax',
        quantity: '1',
        price: '1.350',
        author: 'testaccount8',
        debitor: 'testaccount1',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '316',
        name: 'honey',
        quantity: '5.00',
        price: '3',
        author: 'testaccount8',
        debitor: 'testaccount1',
        creditor: 'testaccount8',
        creditor_approval_time: '2019-11-07 00:06:04.785 +00:00',
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
        rule_instance_id: null
      }
    ]
  },
  {
    time: '2019-11-06 23:52:57.787 +00:00',
    isCreditor: true,
    transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
    author: 'testaccount5',
    contraAccount: 'testaccount5',
    total: '4.360',
    transactions: [
      {
        id: '315',
        name: '9% state sales tax',
        quantity: '1',
        price: '0.360',
        author: 'testaccount5',
        debitor: 'testaccount5',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
        expiration_time: null,
        transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '314',
        name: 'tea',
        quantity: '2',
        price: '2.00',
        author: 'testaccount5',
        debitor: 'testaccount5',
        creditor: 'testaccount1',
        creditor_approval_time: null,
        debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
        expiration_time: null,
        transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
        rule_instance_id: null
      }
    ]
  }
]

const sortedTransactionsGroupedByIdWithKeys = [
  {
    time: '2019-11-07 00:28:53.304 +00:00',
    isCreditor: true,
    transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
    author: 'testaccount1',
    contraAccount: 'testaccount2',
    total: '8.720',
    transactions: [
      {
        id: '319',
        name: '9% state sales tax',
        quantity: '1',
        price: '0.720',
        author: 'testaccount1',
        debitor: 'testaccount2',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '318',
        name: 'milk',
        quantity: '2',
        price: '4.00',
        author: 'testaccount1',
        debitor: 'testaccount2',
        creditor: 'testaccount1',
        creditor_approval_time: '2019-11-07 00:28:53.304 +00:00',
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '92ea2f30-00f5-11ea-a90a-478c7457b385',
        rule_instance_id: null
      }
    ]
  },
  {
    time: '2019-11-07 00:06:04.785 +00:00',
    isCreditor: false,
    transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
    author: 'testaccount8',
    contraAccount: 'testaccount8',
    total: '16.350',
    transactions: [
      {
        id: '317',
        name: '9% state sales tax',
        quantity: '1',
        price: '1.350',
        author: 'testaccount8',
        debitor: 'testaccount1',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '316',
        name: 'honey',
        quantity: '5.00',
        price: '3',
        author: 'testaccount8',
        debitor: 'testaccount1',
        creditor: 'testaccount8',
        creditor_approval_time: '2019-11-07 00:06:04.785 +00:00',
        debitor_approval_time: null,
        expiration_time: null,
        transaction_id: '6330f560-00f2-11ea-90a1-9525e04b53cd',
        rule_instance_id: null
      }
    ]
  },
  {
    time: '2019-11-06 23:52:57.787 +00:00',
    isCreditor: true,
    transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
    author: 'testaccount5',
    contraAccount: 'testaccount5',
    total: '4.360',
    transactions: [
      {
        id: '315',
        name: '9% state sales tax',
        quantity: '1',
        price: '0.360',
        author: 'testaccount5',
        debitor: 'testaccount5',
        creditor: 'StateOfCalifornia',
        creditor_approval_time: null,
        debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
        expiration_time: null,
        transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
        rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
      },
      {
        id: '314',
        name: 'tea',
        quantity: '2',
        price: '2.00',
        author: 'testaccount5',
        debitor: 'testaccount5',
        creditor: 'testaccount1',
        creditor_approval_time: null,
        debitor_approval_time: '2019-11-06 23:52:57.787 +00:00',
        expiration_time: null,
        transaction_id: '8ee69a90-00f0-11ea-9308-2f403f06dc39',
        rule_instance_id: null
      }
    ]
  }
]
