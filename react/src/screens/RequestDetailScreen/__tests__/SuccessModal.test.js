import React from 'react'
import { shallow } from 'enzyme'
import SuccessModal from '../components/SuccessModal'

describe('<SuccessModal />', () => {
  it('renders', () => {
    const wrapper = shallow(<SuccessModal />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
