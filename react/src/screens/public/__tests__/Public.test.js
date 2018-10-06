import React from 'react'
import { shallow } from 'enzyme'
import Public from '..'

describe('<Public />', () => {
  it('renders', () => {
    const wrapper = shallow(<Public match={{ url: '/' }} />)

    expect(wrapper.exists()).toBeTruthy()
  })
})
