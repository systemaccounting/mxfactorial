import React from 'react'
import { shallow } from 'enzyme'

import AccountHeader from '../components/AccountHeader'

describe('<AccountHeader />', () => {
  it('renders', () => {
    const wrapper = shallow(<AccountHeader />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
