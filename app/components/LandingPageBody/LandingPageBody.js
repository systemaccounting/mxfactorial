import React, {PropTypes} from 'react';
import { Link } from 'react-router';

import { reduxForm } from 'redux-form'

import {getAuthDetails} from '../../actions/signUpActions';

// Note: Still need some refactoring
class LandingPageBody extends React.Component {

  onSubmit(values, dispatch) {

    dispatch(getAuthDetails(
      this.context.router,
      values.username,
      values.password
    ))
  }

  render() {
    const {fields: { username, password }, handleSubmit, error} = this.props

    return (
      <div>
        <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="user_login" {...username} required placeholder="User" />
          </div>
          <div className="form-group">
            <input type="password" className="form-control form-spacing text-center" name="password_login" {...password} required placeholder="Password" />
          </div>
          <div className="form-group">
            { error &&
               <div className="help-block">{error}</div>}
            <button type="submit" className="btn btn-info form-spacing btn-style">Log In</button>
            <Link to="/CreateAccountInfo/1"><button type="submit" className="btn btn-primary form-spacing btn-style">Create</button></Link>
          </div>
        </form>
        <div><p style={{textAlign: 'center'}}><u><em><a href="#">Forgot Password</a></em></u></p></div>
      </div>
    );
  }
}

LandingPageBody.contextTypes = {
  router: PropTypes.object
}

export default reduxForm({
  form: 'LoginForm',
  fields: [
    'username', 'password'
  ],
  destroyOnUnmount: false
})(LandingPageBody)