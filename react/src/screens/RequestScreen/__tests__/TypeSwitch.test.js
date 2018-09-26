import React from 'react'
import { shallow } from 'enzyme'

import TypeSwitch from '../components/TypeSwitch'

const switchMock = jest.fn()

describe('<TypeSwitch />', () => {
  it('renders', () => {
    const wrapper = shallow(<TypeSwitch onSwitch={switchMock} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('switches type', () => {
    const wrapper = shallow(<TypeSwitch onSwitch={switchMock} />)
    const button = wrapper.find('Button')
    expect(button).toHaveLength(2)
    button.first().simulate('click')
    expect(switchMock).toHaveBeenCalled()
  })
})
