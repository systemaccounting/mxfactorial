import React from 'react'
import { shallow } from 'enzyme'
import RequestDetailHeader from '../components/RequestDetailHeader'

describe('<RequestDetailHeader />', () => {
  it('renders', () => {
    const wrapper = shallow(<RequestDetailHeader />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
