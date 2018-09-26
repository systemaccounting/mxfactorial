import React from 'react'
import { shallow } from 'enzyme'
import RemoveButton from '../components/Transaction/RemoveButton'
import RemoveIcon from 'icons/RemoveIcon'

describe('<RemoveButton />', () => {
  it('renders', () => {
    const wrapper = shallow(<RemoveButton />)
    expect(wrapper.exists()).toBe(true)
  })
  it('renders remove icon', () => {
    const wrapper = shallow(<RemoveButton />)
    const removeIcon = wrapper.find(RemoveIcon)
    expect(removeIcon.exists()).toBe(true)
  })
})
