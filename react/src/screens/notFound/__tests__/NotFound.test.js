import React from 'react'
import { shallow } from 'enzyme'
import NotFound from '..'

describe('<NotFound />', () => {
  it('renders', () => {
    const wrapper = shallow(<NotFound />)

    expect(wrapper.exists()).toBeTruthy()
  })
})
