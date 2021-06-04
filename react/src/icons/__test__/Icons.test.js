import React from 'react'
import { shallow } from 'enzyme'
import AddIcon from '../AddIcon'
import HomeIcon from '../HomeIcon'
import SubtractIcon from '../SubtractIcon'
import RemoveIcon from '../RemoveIcon'

const props = {
  cssClass: 'icon',
  width: 18,
  height: 18
}

describe('Icons', () => {
  it('renders AddIcon', () => {
    const wrapper = shallow(<AddIcon {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders HomeIcon', () => {
    const wrapper = shallow(<HomeIcon {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders SubtractIcon', () => {
    const wrapper = shallow(<SubtractIcon {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders RemoveIcon', () => {
    const wrapper = shallow(<RemoveIcon {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
