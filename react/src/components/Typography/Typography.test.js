import React from 'react'
import { shallow } from 'enzyme'
import { Small, P, Text, textAlign, sizeVariant } from './Typography'

describe('<Typography />', () => {
  it('renders <Small />', () => {
    const wrapper = shallow(<Small />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders <P />', () => {
    const wrapper = shallow(<P />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders <Text />', () => {
    const wrapper = shallow(<Text />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('handles helpers', () => {
    expect(textAlign({ textAlign: 'right' })).toEqual('text-align: right')
    expect(sizeVariant({ variant: 'normal' })).toEqual('font-size: 1rem')
    expect(sizeVariant({ variant: 'medium' })).toEqual('font-size: 1.5rem')
    expect(sizeVariant({ variant: 'large' })).toEqual('font-size: 2rem')
  })
})
