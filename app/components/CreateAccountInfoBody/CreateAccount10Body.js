import React,{PropTypes} from 'react';
import { Link } from 'react-router';

import '../../../static/images/mxfactorial.png';

import {createAccount, getAuthDetails} from '../../actions/signUpActions';
import {connect} from 'react-redux';

import {
  SUBMIT_PROFILE_DETAILS,
  SUBMIT_AUTH_DETAILS,
  CREATE_ACCOUNT,
  BASE_URL
} from '../../constants/index'


class CreateAccount10Body extends React.Component {

  constructor(props) {
    super(props)
    this.createAccount = this.createAccount.bind(this)
  }

  createAccount() {
    let {form: { sixthForm }, dispatch } = this.props;
      dispatch(getAuthDetails(
        this.context.router,
        sixthForm.user_create.value,
        sixthForm.password_create.value
      ));
  }

  render() {
    return (
      <div className="createAccount10Body">
        <p style={{ textAlign: 'left' }}>A verification email containing a 60 minute expiration was sent.</p>
        <p style={{ textAlign: 'left' }}>After you select the URL sent in the verification email, verify your password on the resulting page to complete creation of an account with a demo balance of 1, 000.</p>
        <p style={{ textAlign: 'left' }}>An email address may again be attempted for registration after authentication fails 3 times on the verification page.</p>
        <img src='../../static/images/mxfactorial.png' className="center-block" style={{ marginTop: 20, marginBottom: 20 }} />
        <button type="submit" onClick={this.createAccount} className="btn btn-info form-spacing btn-style">Okay</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    form: state.form
  }
}

CreateAccount10Body.contextTypes = {
  router: PropTypes.object
}

export default connect(mapStateToProps)(CreateAccount10Body)
