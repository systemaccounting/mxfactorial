import React from 'react'
import { shallow } from 'enzyme'
import DateInput from '../DateInput'

const props = {
  name: 'input',
  value: '',
  placeholder: 'placeholder'
}

describe('<DateInput />', () => {
  it('renders', () => {
    const wrapper = shallow(<DateInput {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
