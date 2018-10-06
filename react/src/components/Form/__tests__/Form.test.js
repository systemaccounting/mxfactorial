import React from 'react'
import Form from '../index'
import { shallow, mount } from 'enzyme'
import Input from '../Input'
import DateInput from '../DateInput'

const formData = {
  id: 'login',
  properties: {
    account: {
      type: 'string',
      inputType: 'text',
      value: '',
      placeholder: 'account',
      required: true
    },
    password: {
      type: 'string',
      inputType: 'password',
      value: '',
      placeholder: 'password',
      required: true
    }
  }
}

const submitLabel = 'Next'

describe('<Form />', () => {
  it('renders', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('renders on disabled', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        disabled
      />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('adds event listener', () => {
    const addEventListenerMock = jest.fn()
    document.addEventListener = addEventListenerMock
    const onSubmitMock = jest.fn()
    const form = mount(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        submitOnEnter
      />
    )

    expect(addEventListenerMock).toHaveBeenCalled()
  })
  it('removes event listener', () => {
    const removeEventListenerMock = jest.fn()
    document.addEventListener = removeEventListenerMock
    const onSubmitMock = jest.fn()
    const form = mount(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        submitOnEnter
      />
    )
    form.unmount()

    expect(removeEventListenerMock).toHaveBeenCalled()
  })

  it('listens Enter keydown', () => {
    const onSubmitMock = jest.fn()
    const wrapper = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        submitOnEnter
      />
    )
    const instance = wrapper.instance()
    instance.setState({ isValid: true })
    instance.listenEnterKeyDown({
      key: 'Enter'
    })

    expect(onSubmitMock).toHaveBeenCalled()
  })

  it('listens only Enter keydown', () => {
    const onSubmitMock = jest.fn()
    const wrapper = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        submitOnEnter
      />
    )
    const instance = wrapper.instance()
    instance.setState({ isValid: true })
    instance.listenEnterKeyDown({
      key: 'Escape'
    })

    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  it('renders with empty form data', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form schema={{}} submitLabel={submitLabel} onSubmit={onSubmitMock} />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('gets initial state from props', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )

    expect(form.state()).toEqual({
      values: { account: '', password: '' },
      isValid: false,
      isClear: true,
      focused: false
    })
  })

  it('renders inputs', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )

    expect(form.find(Input)).toHaveLength(
      Object.keys(formData.properties).length
    )
  })

  it('doesnt render invalid inputs', () => {
    const onSubmitMock = jest.fn()
    const invalidSchema = {
      id: 'login',
      properties: {
        account: {
          type: 'string',
          inputType: 'invalid',
          value: '',
          placeholder: 'account',
          required: true
        }
      }
    }
    const form = shallow(
      <Form
        schema={invalidSchema}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )

    expect(form.find(Input)).toHaveLength(0)
  })

  it('renders date input', () => {
    const onSubmitMock = jest.fn()
    const schemaWithDate = {
      id: 'dateschema',
      properties: {
        account: {
          type: 'string',
          inputType: 'date',
          value: '',
          placeholder: 'account',
          required: true
        }
      }
    }
    const form = shallow(
      <Form
        schema={schemaWithDate}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )
    expect(form.find(DateInput)).toHaveLength(1)
  })

  it('handles input change and update', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )
    const instance = form.instance()
    form
      .find(Input)
      .find({ name: 'account' })
      .simulate('change', {
        target: {
          value: 'test'
        }
      })
    form
      .find(Input)
      .find({ name: 'password' })
      .simulate('change', {
        target: {
          value: 'test'
        }
      })

    expect(form.state()).toEqual({
      values: {
        account: 'test',
        password: 'test'
      },
      isValid: true,
      isClear: false,
      focused: false
    })

    instance.handleSubmit()

    expect(onSubmitMock).toHaveBeenCalledWith({
      account: 'test',
      password: 'test'
    })
  })

  it('does not call onSubmit if its not valid', () => {
    const onSubmitMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
      />
    )
    const instance = form.instance()
    instance.handleSubmit()
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  it('calls onValues update', () => {
    const onSubmitMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        onValuesUpdate={onValuesUpdateMock}
      />
    )
    form
      .find(Input)
      .find({ name: 'account' })
      .simulate('change', {
        target: {
          value: 'test'
        }
      })

    expect(onValuesUpdateMock).toHaveBeenCalledWith({
      account: 'test',
      password: ''
    })
  })

  it('renders clear button', () => {
    const ClearButtonMock = props => <button {...props}>clear</button>
    ClearButtonMock.displayName = 'TestClearButton'
    const form = shallow(
      <Form schema={formData} clearButton={ClearButtonMock} />
    )
    const instance = form.instance()
    const clearSpy = jest.spyOn(instance, 'handleClear')
    const clearButton = form.find('[data-id="login-clear"]')
    expect(clearButton).toHaveLength(1)
  })

  it('handles clear', () => {
    const onSubmitMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        onValuesUpdate={onValuesUpdateMock}
      />
    )
    const instance = form.instance()
    form
      .find(Input)
      .find({ name: 'account' })
      .simulate('change', {
        target: {
          value: 'test'
        }
      })

    instance.handleClear()
    expect(form.state('values')).toEqual({
      account: '',
      password: ''
    })
    expect(onValuesUpdateMock).toHaveBeenCalledTimes(3)
  })

  it('updates values from props', () => {
    const onSubmitMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <Form
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        onValuesUpdate={onValuesUpdateMock}
      />
    )
    const test = { account: '1', password: '2' }
    form.setProps({ test })
    form.update()
    expect(form.state('values')).toEqual({ account: '', password: '' })

    const values = { account: '1', password: '2' }
    form.setProps({ values })
    form.update()
    expect(form.state('values')).toEqual(values)
  })

  it('passes the name prefix to inputs', () => {
    const onSubmitMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <Form
        namePrefix="test"
        schema={formData}
        submitLabel={submitLabel}
        onSubmit={onSubmitMock}
        onValuesUpdate={onValuesUpdateMock}
      />
    )
    const accountInput = form.find(Input).find({ name: 'test-account' })
    expect(accountInput.exists()).toBeTruthy()

    const passwordInput = form.find(Input).find({ name: 'test-password' })
    expect(passwordInput.exists()).toBeTruthy()
  })
})
