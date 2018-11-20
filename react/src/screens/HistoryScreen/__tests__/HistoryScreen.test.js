import React from 'react'
import { shallow } from 'enzyme'
import HistoryScreen from '../HistoryScreen'
import { promiseToResolve } from 'utils/testing'

describe('<HistoryScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryScreen />)
    expect(wrapper.exists()).toBeTruthy()
  })
})
