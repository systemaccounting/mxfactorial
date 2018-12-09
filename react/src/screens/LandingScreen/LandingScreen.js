import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Form from 'components/Form'
import Header from 'components/Header'
import ButtonLink from 'components/ButtonLink'

import s from './LandingScreen.module.css'

const LandingScreenWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  hr {
    display: block;
    margin: auto;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    max-width: 60vw;
  }
`

export const IntroStyled = styled.p`
  font-size: large;
  color: rgba(255, 255, 255, 0.74);
  text-align: center;
  margin: auto;
  margin-bottom: 4rem;
  > a,
  > a:hover {
    color: white;
    padding: 0;
    border-bottom: 2px solid white;
    text-decoration: none;
  }
`

const loginSchema = {
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

class LandingScreen extends Component {
  state = {
    errors: null
  }

  showErrors = errors => this.setState({ errors })

  handleAuth = data => {
    const { history, signIn } = this.props
    const { account, password } = data

    return signIn({ account, password })
      .then(() => {
        history.replace('/account')
      })
      .catch(err => this.showErrors(err))
  }

  render() {
    return (
      <LandingScreenWrapper>
        <Header />
        <IntroStyled>
          Demo web client for{' '}
          <a
            href="https://github.com/systemaccounting/mxfactorial"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i>Mx!</i> platform
          </a>
          .
        </IntroStyled>
        <div>
          <Form
            id="login"
            schema={loginSchema}
            submitLabel="Sign In"
            onSubmit={this.handleAuth}
            submitOnEnter
          />
          <ButtonLink
            to="/auth/create-account"
            text="Create"
            name="create-account"
          />
        </div>
        <div className={s.version} data-id="appVersion">
          <IntroStyled>{process.env.REACT_APP_TEST_VERSION}</IntroStyled>
        </div>
      </LandingScreenWrapper>
    )
  }
}

LandingScreen.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  onClick: PropTypes.func
}

export default LandingScreen
