import React from 'react'
import { shallow } from 'enzyme'
import HistoryDetailHeader from '../components/HistoryDetailHeader'

describe('<HistoryDetailHeader />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryDetailHeader />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
