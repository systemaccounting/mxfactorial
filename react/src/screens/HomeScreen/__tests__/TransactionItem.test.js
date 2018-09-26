import React from 'react'
import { shallow } from 'enzyme'

import Form from 'components/Form'
import TranasctionItem from '../components/Transaction/TransactionItem'
import RemoveButton from '../components/Transaction/RemoveButton'

const props = {
  transaction: {
    uuid: 1,
    name: 'test',
    price: 100,
    quantitiy: 1
  },
  onDelete: jest.fn(),
  onEdit: jest.fn()
}

describe('<TransactionItem />', () => {
  it('renders', () => {
    const wrapper = shallow(<TranasctionItem {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('edits', () => {
    const wrapper = shallow(<TranasctionItem {...props} />)
    const priceInput = wrapper.find(Form)
    priceInput.simulate('valuesUpdate')
    expect(props.onEdit).toHaveBeenCalled()
  })
})
