import React from 'react'
import { shallow } from 'enzyme'
import HistoryScreen from '../HistoryScreen'
import { promiseToResolve } from 'utils/testing'

const mockRequests = [
  {
    timeuuid: '1234',
    debitor: 'JoeSmith',
    creditor: 'Mary',
    name: 'bread',
    price: '3000.00',
    quantity: '2.00',
    transaction_id: '12345',
    expiration_time: '2018-10-26T21:32:52',
    rejection_time: ''
  }
]

const fetchHistory = promiseToResolve(mockRequests)
const fetchBalance = () => promiseToResolve(1000)
const user = { username: 'some user' }

const props = {
  fetchBalance,
  fetchHistory,
  user
}

describe('<HistoryScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('loads history', async () => {
    const wrapper = shallow(<HistoryScreen {...props} />)
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    expect(wrapper.state('history')).toEqual(mockRequests)
  })

  it('loads balance', async () => {
    const wrapper = shallow(<HistoryScreen {...props} />)
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    setTimeout(() => {
      expect(wrapper.state('balance')).toEqual(1000)
    })
  })
})
