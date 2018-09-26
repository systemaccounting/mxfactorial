import React from 'react'
import styled from 'styled-components'

import RenderByStep from 'components/RenderByStep'
import TermsOfUse from './TermsOfUse'
import Form from 'components/Form'
import Header from 'components/Header'
import MainWrapper from 'components/MainWrapper'
import termsOfUseData from './TermsOfUse.data.js'
import schemas from './schemas'

const CreateAccountFormWrapper = styled(MainWrapper)`
  margin: 2rem auto;
`

class CreateAccount extends React.Component {
  state = {
    step: 0,
    data: {},
    errors: null
  }

  handleSignUp = () => {
    const { signUp, navigate } = this.props
    const { username, password, ...attributes } = this.state.data
    return signUp({ username, password }, attributes)
      .then(() => navigate('/'))
      .catch(errors => this.setState({ errors }))
  }

  handleNextForm = (newData = {}) => {
    this.setState(
      state => ({
        step: Math.min(state.step + 1, termsOfUseData.length + schemas.length),
        data: { ...state.data, ...newData }
      }),
      () => {
        if (this.state.step >= termsOfUseData.length + schemas.length - 1) {
          this.handleSignUp()
        }
      }
    )
  }

  handleNextTermOfUse = () => this.setState(state => ({ step: state.step + 1 }))

  render() {
    const { handleNextForm, handleNextTermOfUse } = this
    return (
      <div>
        <Header />
        <RenderByStep step={this.state.step}>
          {termsOfUseData.map((term, index) => (
            <TermsOfUse
              key={`term-of-use-${index}`}
              label={term.label}
              nextStep={handleNextTermOfUse}
              content={term.content}
            />
          ))}
          {schemas.map((form, index) => (
            <CreateAccountFormWrapper key={`form-${index}`}>
              <Form
                key={`form-${index}`}
                schema={form}
                submitLabel={form.label}
                onSubmit={handleNextForm}
              />
            </CreateAccountFormWrapper>
          ))}
        </RenderByStep>
      </div>
    )
  }
}

export default CreateAccount
