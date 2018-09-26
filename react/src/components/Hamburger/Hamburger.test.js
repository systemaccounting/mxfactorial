import React from 'react'
import { shallow, mount } from 'enzyme'

import Hamburger from './index'

describe('<Hamburger />', () => {
  it('renders', () => {
    const wrapper = shallow(<Hamburger />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
