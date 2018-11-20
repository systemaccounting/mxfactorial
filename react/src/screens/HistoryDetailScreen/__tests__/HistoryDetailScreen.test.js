import React from 'react'
import { shallow } from 'enzyme'
import HistoryDetailScreen from '../HistoryDetailScreen'

describe('<HistoryDetailScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryDetailScreen />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
