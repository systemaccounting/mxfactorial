import React from 'react'
import { shallow, mount } from 'enzyme'
import { act } from '@testing-library/react'
import { promiseToResolve, promiseToReject } from 'utils/testing'
import { fetchRules } from 'queries/rules'
import { HomeScreen } from '../HomeScreen'

const user = {
  username: 'john doe'
}
const signOut = promiseToResolve('signout')
const currentUserInfo = promiseToResolve(user)
const fetchBalance = promiseToResolve(1000)
const props = {
  signOut,
  currentUserInfo,
  fetchBalance,
  user
}

describe('<HomeScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HomeScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('loads balance', () => {
    const wrapper = shallow(<HomeScreen {...props} />)
    const instance = wrapper.instance()

    instance.getBalance().then(() => {
      expect(wrapper.state('balance')).toEqual(1000)
    })
  })

  it('doesnt load balance', () => {
    const fetchBalance = promiseToReject('no balance')
    const wrapper = shallow(
      <HomeScreen {...props} fetchBalance={fetchBalance} />
    )
    const instance = wrapper.instance()

    instance.getBalance().then(() => {
      expect(wrapper.state('error')).toEqual('no balance')
    })
  })

  it('fetches rules on item input blur', () => {
    const client = {
      query: jest.fn(() => Promise.resolve({ data: { rules: [] } }))
    }
    const initialValues = {
      recipient: 'Person1',
      type: 'credit',
      items: [
        {
          name: 'Milk',
          price: '3',
          quantity: '3',
          author: user.username,
          debitor: 'Person1',
          creditor: user.username
        },
        {
          name: 'Honey',
          price: '3',
          quantity: '3',
          author: user.username,
          debitor: 'Person1',
          creditor: user.username
        }
      ]
    }
    const wrapper = mount(
      <HomeScreen {...props} initialValues={initialValues} client={client} />
    )
    wrapper.find('input[name="items[0].name"]').simulate('blur')
    expect(client.query).toHaveBeenCalledWith({
      query: fetchRules,
      addTypename: false,
      variables: {
        transactions: initialValues.items
      }
    })
  })

  it('submits from correctly', async () => {
    const initialValues = {
      recipient: 'Person1',
      type: 'credit',
      items: [
        {
          name: 'Milk',
          price: '3',
          quantity: '3',
          author: user.username,
          debitor: 'Person1',
          creditor: user.username
        },
        {
          name: 'Honey',
          price: '3',
          quantity: '3',
          author: user.username,
          debitor: 'Person1',
          creditor: user.username
        }
      ]
    }
    const createTransaction = jest.fn()
    const wrapper = mount(
      <HomeScreen
        {...props}
        createTransaction={createTransaction}
        initialValues={initialValues}
      />
    )
    const form = wrapper.find('form')
    await act(async () => {
      form.simulate('submit')
    })
    expect(createTransaction).toBeCalledWith([...initialValues.items])
  })
})
