import { renderProps } from '../withTransactions'

const input = [
  {
    id: 0,
    name: 'Milk',
    quantity: 1,
    price: 7.2,
    author: 'Person1',
    debitor: 'Person1',
    creditor: 'Mary',
    creditor_approval_time: null,
    debitor_approval_time: '2019-05-06 16:06:16'
  },
  {
    id: 1,
    name: 'Honey',
    quantity: 1,
    price: 7.2,
    author: 'Person1',
    debitor: 'Person1',
    creditor: 'Mary',
    creditor_approval_time: null,
    debitor_approval_time: '2019-06-06 16:06:16'
  },
  {
    id: 2,
    name: 'Bread',
    quantity: 2,
    price: 5,
    author: 'Person1',
    debitor: 'Person1',
    creditor: 'Mary',
    creditor_approval_time: '2019-03-06 16:06:16',
    debitor_approval_time: null
  }
]
const sortedArray = [input[1], input[0], input[2]]

describe('withTransactions', () => {
  it('sorts transactions by approval time', () => {
    const props = renderProps({ data: { requestsByAccount: input } })
    expect(props.transactions).toEqual(sortedArray)
  })
})
