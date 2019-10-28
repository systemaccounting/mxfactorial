import React from 'react'
import AutoForm from '../index'
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

describe('<AutoForm />', () => {
  it('renders', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
      />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('renders on disabled', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
        disabled
      />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('adds event listener', () => {
    const addEventListenerMock = jest.fn()
    document.addEventListener = addEventListenerMock
    const form = mount(
      <AutoForm schema={formData} submitLabel={submitLabel} submitOnEnter />
    )

    expect(addEventListenerMock).toHaveBeenCalled()
  })
  it('removes event listener', () => {
    const removeEventListenerMock = jest.fn()
    document.addEventListener = removeEventListenerMock
    const form = mount(
      <AutoForm schema={formData} submitLabel={submitLabel} submitOnEnter />
    )
    form.unmount()

    expect(removeEventListenerMock).toHaveBeenCalled()
  })

  it('listens Enter keydown', () => {
    const onSubmitSignInMock = jest.fn()
    const wrapper = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
        submitOnEnter
      />
    )
    const instance = wrapper.instance()
    instance.setState({ isValid: true })
    instance.listenEnterKeyDown({
      key: 'Enter'
    })

    expect(onSubmitSignInMock).toHaveBeenCalled()
  })

  it('listens only Enter keydown', () => {
    const onSubmitSignInMock = jest.fn()
    const wrapper = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
        submitOnEnter
      />
    )
    const instance = wrapper.instance()
    instance.setState({ isValid: true })
    instance.listenEnterKeyDown({
      key: 'Escape'
    })

    expect(onSubmitSignInMock).not.toHaveBeenCalled()
  })

  it('renders with empty form data', () => {
    const form = shallow(<AutoForm schema={{}} submitLabel={submitLabel} />)
    expect(form.exists()).toBeTruthy()
  })

  it('gets initial state from props', () => {
    const form = shallow(<AutoForm schema={formData} />)

    expect(form.state()).toEqual({
      values: { account: '', password: '' },
      isValid: false,
      isClear: true,
      focused: false
    })
  })

  it('renders inputs', () => {
    const form = shallow(<AutoForm schema={formData} />)
    expect(form.find(Input)).toHaveLength(
      Object.keys(formData.properties).length
    )
  })

  it('doesnt render invalid inputs', () => {
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
    const form = shallow(<AutoForm schema={invalidSchema} />)

    expect(form.find(Input)).toHaveLength(0)
  })

  it('renders date input', () => {
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
    const form = shallow(<AutoForm schema={schemaWithDate} />)
    expect(form.find(DateInput)).toHaveLength(1)
  })

  it('handles sign in input change and update', () => {
    const onSubmitSignInMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
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

    instance.handleSubmitSignIn()

    expect(onSubmitSignInMock).toHaveBeenCalledWith({
      account: 'test',
      password: 'test'
    })
  })

  it('onSubmitSignIn not called with invalid input', () => {
    const onSubmitSignInMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
      />
    )
    const instance = form.instance()
    instance.handleSubmitSignIn()
    expect(onSubmitSignInMock).not.toHaveBeenCalled()
  })

  it('calls onSubmitCreateAccount', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
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

    instance.handleSubmitCreateAccount()

    expect(onSubmitCreateAccountMock).toHaveBeenCalledWith({
      account: 'test',
      password: 'test'
    })
  })

  it('onSubmitCreateAccount not called with invalid input', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
      />
    )
    const instance = form.instance()
    instance.handleSubmitCreateAccount()
    expect(onSubmitCreateAccountMock).not.toHaveBeenCalled()
  })

  it('calls onValues update', () => {
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <AutoForm schema={formData} onValuesUpdate={onValuesUpdateMock} />
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
      <AutoForm schema={formData} clearButton={ClearButtonMock} />
    )
    const instance = form.instance()
    const clearSpy = jest.spyOn(instance, 'handleClear')
    const clearButton = form.find('[data-id="login-clear"]')
    expect(clearButton).toHaveLength(1)
  })

  it('handles clear', () => {
    const onSubmitSignInMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
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
    const onSubmitSignInMock = jest.fn()
    const onValuesUpdateMock = jest.fn()
    const form = shallow(
      <AutoForm
        schema={formData}
        submitLabel={submitLabel}
        onSubmitSignIn={onSubmitSignInMock}
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
    const form = shallow(<AutoForm namePrefix="test" schema={formData} />)
    const accountInput = form.find(Input).find({ name: 'test-account' })
    expect(accountInput.exists()).toBeTruthy()

    const passwordInput = form.find(Input).find({ name: 'test-password' })
    expect(passwordInput.exists()).toBeTruthy()
  })
})
