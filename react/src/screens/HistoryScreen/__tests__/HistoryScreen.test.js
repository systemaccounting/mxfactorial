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

const fetchHistoryMock = promiseToResolve(mockRequests)

describe('<HistoryScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryScreen />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('loads history', async () => {
    const wrapper = shallow(<HistoryScreen fetchHistory={fetchHistoryMock} />)
    const instance = wrapper.instance()
    await instance.componentDidMount()
    expect(wrapper.state('history')).toEqual(mockRequests)
  })
})
