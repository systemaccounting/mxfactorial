import React from 'react'
import { shallow, mount } from 'enzyme'
import { promiseToResolve, promiseToReject } from 'utils/testing'
import HomeScreen from '../HomeScreen'

const user = {
  username: 'john doe'
}
const signOut = promiseToResolve('signout')
const currentUserInfo = promiseToResolve(user)
const fetchBalance = promiseToResolve(1000)
const props = {
  signOut,
  currentUserInfo,
  fetchBalance,
  user
}

describe('<HomeScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HomeScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('loads balance', () => {
    const wrapper = shallow(<HomeScreen {...props} />)
    const instance = wrapper.instance()

    instance.getBalance().then(user => {
      expect(wrapper.state('balance')).toEqual(1000)
    })
  })

  it('doesnt load balance', () => {
    const fetchBalance = promiseToReject('no balance')
    const wrapper = shallow(
      <HomeScreen {...props} fetchBalance={fetchBalance} />
    )
    const instance = wrapper.instance()

    instance.getBalance().then(user => {
      expect(wrapper.state('error')).toEqual('no balance')
    })
  })
})
