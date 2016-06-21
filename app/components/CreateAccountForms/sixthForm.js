import React, { Component ,PropTypes} from 'react'

import { reduxForm } from 'redux-form'
import { Link ,Router} from 'react-router'

import 'whatwg-fetch';

import { checkStatus } from '../../utils/fetch';
import { BASE_URL } from '../../constants'
import { signupValidation } from '../../utils/validation'


class sixthForm extends Component {

  onSubmit(values, dispatch) {
    // Create user and check if username is unique
    // Note: It is not advised to perfrom ajax request in a component
    return fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          ...this.props.profileDetails
        })
      })
      //.then(checkStatus)
      .then(response => response.json())
      .then((data) => {
        if (data.error) {
          if (data.type && data.type === 'username') {
            return Promise.reject({ user_create: 'Username already exist', _error: 'Signup failed!' })
          } else {
            return Promise.reject({ user_create: "error while creating user"})
          }
        } else if (data.mutationResults) {
          this.context.router.push(this.props.nextRoute);
        } else {
          alert("Unable to authenticate username");
        }
      })
      .catch((error) => {
        alert("Unable to authenticate username");
      })
  }

  render () {

    const { fields: {
              user_create, password_create, email_address_create
            },
            handleSubmit
          } = this.props

    return (
      <div className="createAccount04Body">
        <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <div className={user_create.error ? 'form-group has-error' : 'form-group'}>
              <input type="text" className="form-control form-spacing text-center"  {...user_create}  placeholder="user*" />
              {user_create.touched && user_create.error &&
               <div className="help-block">{user_create.error}</div>}
          </div>
          <div className={password_create.error ? 'form-group has-error' : 'form-group'}>
              <input type="password" className="form-control form-spacing text-center" {...password_create}  placeholder="password*" />
              {password_create.touched && password_create.error && <div className="help-block">{password_create.error}</div>}
          </div>
          <div className={email_address_create.error ? 'form-group has-error' : 'form-group'}>
              <input type="email" className="form-control form-spacing text-center" {...email_address_create}  placeholder="email*" />
              {email_address_create.touched && email_address_create.error && <div className="help-block">{email_address_create.error}</div>}
          </div>
          <div className="form-group">
              <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
              <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
          </div>
        </form>
      </div>
    )
  }
}

sixthForm.contextTypes = {
  router: PropTypes.object
}

let mapStateToProps = (state) => ({
  profileDetails: state.accountDetails.profile
})

export default reduxForm({
  form: 'sixthForm',
  fields: [
    'user_create', 'password_create', 'email_address_create'
  ],
  validate: signupValidation,
  destroyOnUnmount: false
}, mapStateToProps)(sixthForm)
