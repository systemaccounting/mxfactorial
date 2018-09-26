import React from 'react'
import { shallow } from 'enzyme'
import Button, { ButtonBase } from './index'
import themes from './themes'

describe('<Button />', () => {
  it('renders', () => {
    const wrapper = shallow(<Button />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders with theme', () => {
    const wrapper = shallow(<Button theme="secondary" />)
    expect(wrapper.exists()).toBeTruthy()
    const base = wrapper.find(ButtonBase)
    expect(base.prop('theme')).toEqual(themes.secondary)
  })
  it('renders ButtonBase', () => {
    const theme = {
      backgroundColor: 'red'
    }
    const wrapper = shallow(<ButtonBase theme={theme} />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
