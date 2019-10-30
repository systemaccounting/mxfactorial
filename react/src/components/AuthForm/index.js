import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { validate } from 'jsonschema'
import * as R from 'ramda'

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
    namePrefix: PropTypes.string
  }

  static defaultProps = {
    submitOnEnter: false,
    theme: 'primary',
    onValuesUpdate: noop,
    onSubmit: null,
    clearButton: () => <div />,
    onClear: () => {},
    onInputBlur: () => {},
    namePrefix: null
  }

  validationSchema = null
  inputs = null

  constructor(props) {
    super(props)
    const { properties } = props.schema
    const { values } = props
    this.inputs = properties
      ? Object.keys(properties).map(key => {
          const { inputType, value, placeholder } = properties[key]
          return {
            type: inputType,
            name: key,
            value,
            placeholder
          }
        })
      : []

    const currentValues = R.pipe(
      R.keys,
      R.map(key => ({ [key]: properties[key].value })),
      R.mergeAll
    )(properties)

    this.state = {
      values: R.merge(currentValues)(values),
      isValid: false,
      isClear: true,
      focused: false
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { values } = nextProps
    const { focused } = prevState
    return values && !focused ? { values } : null
  }

  clearValues = () =>
    this.setState(
      {
        values: R.pipe(
          R.keys,
          R.map(key => ({ [key]: '' })),
          R.mergeAll
        )(this.props.schema.properties),
        isClear: true
      },
      () => this.validateInputs()
    )

  updateValue = key => e => {
    const newValue = e.target.value
    this.setState(
      state => ({
        isClear: false,
        values: { ...state.values, [key]: newValue }
      }),
      () => this.validateInputs()
    )
  }

  validateInputs = () => {
    const { values, isValid } = this.state
    const result = validate(
      R.pipe(R.reject(R.isEmpty))(values),
      this.props.schema
    )
    this.handleValuesUpdate()
    if (isValid !== result.valid) {
      this.setState({ isValid: result.valid })
    }
  }

  handleValuesUpdate = () => {
    const { onValuesUpdate } = this.props
    const { values } = this.state
    onValuesUpdate(values)
  }

  handleSubmitSignIn = () => {
    const { onSubmitSignIn } = this.props
    const { isValid, values } = this.state
    this.clearValues()
    if (isValid) {
      onSubmitSignIn(values)
    }
  }

  handleSubmitCreateAccount = async () => {
    const { onSubmitCreateAccount, onSubmitSignIn } = this.props
    const { isValid, values } = this.state
    this.clearValues()
    if (isValid) {
      await onSubmitCreateAccount(values)
      await onSubmitSignIn(values)
    }
  }

  handleFocus = () => this.setState({ focused: true })

  handleBlur = () => {
    this.setState({ focused: false })
    this.props.onInputBlur()
  }

  handleClear = () => {
    const { isClear } = this.state
    const {
      schema: { properties },
      onValuesUpdate,
      onClear
    } = this.props
    this.setState(
      {
        isClear: true,
        values: R.pipe(
          R.keys,
          R.map(key => ({ [key]: '' })),
          R.mergeAll
        )(properties)
      },
      () => {
        onValuesUpdate(this.state.values)
        onClear(isClear)
      }
    )
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
        value: this.state.values[data.name],
        onChange: this.updateValue(data.name),
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onKeyPress: this.keyDown
      }
      switch (data.type) {
        case 'text':
          return <Input {...props} />
        case 'password':
          return <Input {...props} type="password" />
        case 'date':
          return <DateInput {...props} type="date" />
        default:
          return null
      }
    })
  }
  render() {
    const { isValid } = this.state
    const {
      disabled,
      theme,
      schema,
      onSubmitSignIn,
      onSubmitCreateAccount,
      clearButton: ClearButton
    } = this.props
    return (
      <FormWrapper
        onSubmit={e => {
          this.handleSubmitSignIn()
          e.preventDefault()
        }}
      >
        <FormContainer>
          <ClearButtonWrapper>
            <ClearButton
              data-id={`${schema.id}-clear`}
              onClick={this.handleClear}
            />
          </ClearButtonWrapper>
          {this.renderInputs()}
          {!disabled && onSubmitSignIn && onSubmitCreateAccount ? (
            <React.Fragment>
              <Button
                data-id="signInButton"
                theme={theme}
                disabled={!isValid}
                onClick={this.handleSubmitSignIn}
                type="submit"
              >
                Sign In
              </Button>
              <Button
                data-id="createAccountButton"
                theme="createAccount"
                disabled={!isValid}
                type="button"
                onClick={this.handleSubmitCreateAccount}
              >
                Create
              </Button>
            </React.Fragment>
          ) : null}
        </FormContainer>
      </FormWrapper>
    )
  }
}

export default AuthForm
