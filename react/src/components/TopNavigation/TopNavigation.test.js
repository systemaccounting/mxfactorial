import React from 'react'
import { shallow } from 'enzyme'
import TopNavigation from './'

describe('<TopNavigation />', () => {
  it('renders', () => {
    const wrapper = shallow(<TopNavigation />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
