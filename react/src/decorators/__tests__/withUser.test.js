import React from 'react'
import { shallow, mount } from 'enzyme'

import withUser from '../withUser'

jest.mock('context/User/UserContext', () => ({
  UserConsumer: ({ children }) => children({ user: { username: 'test' } })
}))

describe('withUser', () => {
  it('renders', () => {
    const DecoratedComponent = withUser(() => <div />)
    const wrapper = shallow(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
  it('mounts', () => {
    const DecoratedComponent = withUser(() => <div />)
    const wrapper = mount(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
})
