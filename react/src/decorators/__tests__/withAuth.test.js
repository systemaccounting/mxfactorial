import React from 'react'
import { shallow, mount } from 'enzyme'

import withAuth, { currentUserInfo, signIn, signOut, signUp } from '../withAuth'

describe('withAuth', () => {
  it('renders', () => {
    const DecoratedComponent = withAuth(() => <div />)
    const wrapper = shallow(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
  it('mounts', () => {
    const DecoratedComponent = withAuth(() => <div />)
    const wrapper = mount(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
})
