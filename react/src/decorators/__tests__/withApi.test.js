import React from 'react'
import { shallow, mount } from 'enzyme'

import withApi from '../withApi'

describe('withApi', () => {
  it('renders', () => {
    const DecoratedComponent = withApi(() => <div />)
    const wrapper = shallow(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
  it('mounts', () => {
    const DecoratedComponent = withApi(() => <div />)
    const wrapper = mount(<DecoratedComponent />)

    expect(wrapper.exists()).toBeTruthy()
  })
})
