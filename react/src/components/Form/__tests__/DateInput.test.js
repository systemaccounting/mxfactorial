import React from 'react'
import { shallow } from 'enzyme'
import DateInput from '../DateInput'
import Input from '../Input'

const props = {
  name: 'input',
  value: '',
  placeholder: 'placeholder'
}

describe('<Input />', () => {
  it('renders', () => {
    const wrapper = shallow(<DateInput {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('handles blur and focus', () => {
    const wrapper = shallow(<DateInput {...props} />)

    expect(wrapper.state('type')).toEqual('text')
    const input = wrapper.find(Input)
    input.simulate('focus')
    expect(wrapper.state('type')).toEqual('date')
    input.simulate('blur')
    expect(wrapper.state('type')).toEqual('text')
  })
})
