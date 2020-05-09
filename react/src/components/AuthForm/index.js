import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form, Field } from 'react-final-form'

import { noop } from 'utils'
import Input from './Input'
import Button from 'components/Button'
import DateInput from './DateInput'

export const FormWrapper = styled.form`
  text-align: center;
  > a {
    display: inline-block;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
`
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 0;
`

export const ClearButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
`

const required = value => (value ? undefined : 'Required')

class AuthForm extends React.Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    clearButton: PropTypes.func,
    onSubmit: PropTypes.func,
    onValuesUpdate: PropTypes.func,
    onInputBlur: PropTypes.func,
    onClear: PropTypes.func,
    submitOnEnter: PropTypes.bool,
    disabled: PropTypes.bool,
    theme: PropTypes.string,
    onSubmitSignIn: PropTypes.func,
    namePrefix: PropTypes.string
  }

  static defaultProps = {
    submitOnEnter: false,
    theme: 'primary',
    onValuesUpdate: noop,
    onSubmit: null,
    clearButton: () => <div />,
    onClear: () => {},
    onSubmitSignIn: () => {},
    namePrefix: null
  }

  inputs = []

  constructor(props) {
    super(props)
    const { properties } = props.schema
    this.inputs = properties
      ? Object.keys(properties).map(key => {
          const {
            inputType,
            value,
            placeholder,
            required = false
          } = properties[key]
          return {
            type: inputType,
            name: key,
            value,
            placeholder,
            required
          }
        })
      : []
  }

  onSubmit = values => this.props.onSubmitSignIn(values)

  handleSubmitCreateAccount = async values => {
    const { onSubmitCreateAccount, onSubmitSignIn } = this.props
    await onSubmitCreateAccount(values)
    await onSubmitSignIn(values)
  }

  renderInputs = () => {
    const { disabled, namePrefix } = this.props
    const prefix = namePrefix ? `${namePrefix}-` : ''
    return this.inputs.map(data => {
      const props = {
        disabled: disabled,
        key: `input-key-${data.name}`,
        name: `${prefix}${data.name}`,
        placeholder: data.placeholder,
        validate: data.required ? required : null,
        onFocus: this.handleFocus
      }

      switch (data.type) {
        case 'text':
        case 'password':
          return (
            <Field key={data.name} type={data.type} {...props}>
              {inputProps => <Input {...inputProps.input} />}
            </Field>
          )
        case 'date':
          return (
            <Field key={data.name} type={data.type} {...props}>
              {inputProps => <DateInput {...inputProps.input} type="date" />}
            </Field>
          )
        default:
          return null
      }
    })
  }

  renderForm = ({ handleSubmit, valid, reset, values }) => {
    const { theme, schema, clearButton: ClearButton } = this.props

    return (
      // Reset form on submit
      <form onSubmit={handleSubmit}>
        <FormContainer>
          <ClearButtonWrapper>
            <ClearButton data-id={`${schema.id}-clear`} onClick={reset} />
          </ClearButtonWrapper>
          {this.renderInputs()}
          <Button
            data-id="signInButton"
            theme={theme}
            disabled={!valid}
            type="submit"
          >
            Sign In
          </Button>
          <Button
            data-id="createAccountButton"
            theme="createAccount"
            disabled={!valid}
            type="button"
            onClick={() => this.handleSubmitCreateAccount(values).then(reset)}
          >
            Create
          </Button>
        </FormContainer>
      </form>
    )
  }

  render() {
    const { schema, namePrefix } = this.props

    // Extract initial values from schema property
    const initialValues = schema.properties
      ? Object.keys(schema.properties).reduce((result, key) => {
          result[namePrefix ? `${namePrefix}-${key}` : key] =
            schema.properties[key].value
          return result
        }, {})
      : {}

    return (
      <Form
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        render={this.renderForm}
      />
    )
  }
}

export default AuthForm
