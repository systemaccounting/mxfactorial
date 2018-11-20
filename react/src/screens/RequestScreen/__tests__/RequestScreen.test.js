import React from 'react'
import { shallow } from 'enzyme'
import RequestScreen from '../RequestScreen'
import { promiseToResolve } from 'utils/testing'

const mockRequests = {
  active: [
    {
      timeuuid: '1234',
      debitor: 'Mary',
      creditor: 'JoeSmith',
      name: 'bread',
      price: '3000.00',
      quantity: '2.00',
      transaction_id: '12345',
      expiration_time: '2018-10-26T21:32:52',
      rejection_time: ''
    }
  ],
  rejected: [
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
}
const mockUser = { username: 'JoeSmith' }
const currentUserInfoMock = promiseToResolve(mockUser)
const fetchRequestsMock = promiseToResolve(mockRequests)

describe('<RequestScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(
      <RequestScreen
        user={mockUser}
        fetchRequests={fetchRequestsMock}
        currentUserInfo={currentUserInfoMock}
      />
    )
    expect(wrapper.exists()).toBeTruthy()
  })

  it('loads requests', async () => {
    const wrapper = shallow(
      <RequestScreen
        user={mockUser}
        currentUserInfo={currentUserInfoMock}
        fetchRequests={fetchRequestsMock}
      />
    )
    const instance = wrapper.instance()
    await instance.handleFetchRequests()
    expect(wrapper.state('requests')).toEqual(mockRequests)
  })

  it('handles switch between active/expired', () => {
    const wrapper = shallow(
      <RequestScreen
        user={mockUser}
        fetchRequests={fetchRequestsMock}
        currentUserInfo={currentUserInfoMock}
      />
    )
    const instance = wrapper.instance()
    instance.handleSwitch('rejected')()
    expect(wrapper.state('status')).toEqual('rejected')
  })
})
