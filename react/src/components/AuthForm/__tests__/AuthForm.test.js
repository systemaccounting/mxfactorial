import React from 'react'
import { Form, Field } from 'react-final-form'
import AuthForm from '../index'
import { shallow } from 'enzyme'
import Input from '../Input'

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

describe('<AuthForm />', () => {
  it('renders', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()
    const form = shallow(
      <AuthForm
        schema={formData}
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
      <AuthForm
        schema={formData}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
        disabled
      />
    )
    expect(form.exists()).toBeTruthy()
  })

  it('renders with empty form data', () => {
    const form = shallow(<AuthForm schema={{}} />)
    expect(form.exists()).toBeTruthy()
  })

  it('gets initial state from props', () => {
    const form = shallow(<AuthForm schema={formData} />)

    expect(form.find(Form).props().initialValues).toEqual({
      account: '',
      password: ''
    })
  })

  it('renders inputs', () => {
    const form = shallow(<AuthForm schema={formData} />)
    expect(form.dive().find(Field)).toHaveLength(
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
    const form = shallow(<AuthForm schema={invalidSchema} />)

    expect(form.dive().find(Input)).toHaveLength(0)
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
    const form = shallow(<AuthForm schema={schemaWithDate} />)
    expect(
      form
        .dive()
        .find(Field)
        .filter({ type: 'date' })
    ).toHaveLength(1)
  })

  it('handles sign in input change and update', () => {
    const onSubmitSignInMock = jest.fn()
    const filledForm = {
      ...formData,
      properties: {
        account: {
          ...formData.properties.account,
          value: 'test'
        },
        password: {
          ...formData.properties.password,
          value: 'test'
        }
      }
    }
    const form = shallow(
      <AuthForm schema={filledForm} onSubmitSignIn={onSubmitSignInMock} />
    )
    form
      .dive()
      .find('form')
      .simulate('submit', { preventDefault() {} })

    expect(onSubmitSignInMock).toHaveBeenCalledWith({
      account: 'test',
      password: 'test'
    })
  })

  it('calls onSubmitCreateAccount', () => {
    const onSubmitSignInMock = jest.fn()
    const onSubmitCreateAccountMock = jest.fn()

    const filledForm = {
      ...formData,
      properties: {
        account: {
          ...formData.properties.account,
          value: 'test'
        },
        password: {
          ...formData.properties.password,
          value: 'test'
        }
      }
    }
    const form = shallow(
      <AuthForm
        schema={filledForm}
        onSubmitSignIn={onSubmitSignInMock}
        onSubmitCreateAccount={onSubmitCreateAccountMock}
      />
    )

    const createAccountBtn = form.dive().find('[data-id="createAccountButton"]')
    createAccountBtn.simulate('click')

    expect(onSubmitCreateAccountMock).toHaveBeenCalledWith({
      account: 'test',
      password: 'test'
    })
  })

  it('renders clear button', () => {
    const ClearButtonMock = props => <button {...props}>clear</button>
    ClearButtonMock.displayName = 'TestClearButton'
    const form = shallow(
      <AuthForm schema={formData} clearButton={ClearButtonMock} />
    )
    const clearButton = form.dive().find('[data-id="login-clear"]')
    expect(clearButton).toHaveLength(1)
  })

  it('passes the name prefix to inputs', () => {
    const form = shallow(<AuthForm namePrefix="test" schema={formData} />)
    const accountInput = form
      .dive()
      .find(Field)
      .find({ name: 'test-account' })
    expect(accountInput.exists()).toBeTruthy()

    const passwordInput = form
      .dive()
      .find(Field)
      .find({ name: 'test-password' })
    expect(passwordInput.exists()).toBeTruthy()
  })
})
