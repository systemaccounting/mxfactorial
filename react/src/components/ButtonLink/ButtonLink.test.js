import React from 'react'
import { shallow } from 'enzyme'
import ButtonLink from './index'

describe('<Button />', () => {
  it('renders', () => {
    const wrapper = shallow(<ButtonLink text="test" to="/" />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
