import React from 'react'
import { shallow } from 'enzyme'

import LabelWithValue, { Label, Value } from './index'

describe('<LabelWithValue />', () => {
  it('renders', () => {
    const wrapper = shallow(<LabelWithValue name="test" label="x" value="y" />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders label', () => {
    const wrapper = shallow(<LabelWithValue name="test" label="x" value="y" />)
    const label = wrapper.find(Label)
    expect(label.exists()).toBeTruthy()
    expect(label.children().text()).toEqual('x')
  })
  it('renders value', () => {
    const wrapper = shallow(<LabelWithValue name="test" label="x" value="y" />)
    const value = wrapper.find(Value)
    expect(value.exists()).toBeTruthy()
    expect(value.children().text()).toEqual('y')
  })
})
