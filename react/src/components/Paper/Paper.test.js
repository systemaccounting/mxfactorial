import React from 'react'
import { shallow } from 'enzyme'

import Paper from './index'

describe('<HistoryScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<Paper />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
