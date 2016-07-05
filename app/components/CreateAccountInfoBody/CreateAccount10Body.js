import React, { Component, PropTypes } from 'react';
import assign from 'lodash/assign';

import mxfactorial from 'images/mxfactorial.png';
import transformFormData from 'utils/transformFormData';

const createAccountForm = ['firstForm', 'secondForm', 'thirdForm', 'fourthForm', 'fifthForm', 'sixthForm'];

export default class CreateAccount10Body extends Component {
  constructor(props) {
    super(props);
    this.createAccount = this.createAccount.bind(this);
    this.state = {
      errorMessage: ''
    };
  }
  createAccount() {
    const { accountDetails, postCreateAccount } = this.props;
    const { auth, profile } = accountDetails.account;
    const postObject = assign({}, auth, profile);

    postCreateAccount(transformFormData(postObject))
      .then((action) => {
        if (!action.error) {
          createAccountForm.forEach((formName) => {
            this.props.reset(formName);
          });

          this.context.router.push('/');
        } else {
          this.setState({
            errorMessage: action.payload.message
          });
        }
      });
  }
  render() {
    return (
      <div className='createAccount10Body'>
        <p style={ { textAlign: 'left' } }>A verification email containing a 60 minute expiration was sent.</p>
        <p style={ { textAlign: 'left' } }>
          After you select the URL sent in the verification email, verify your password on the resulting page to
          complete creation of an account with a demo balance of 1, 000.
        </p>
        <p style={ { textAlign: 'left' } }>
          An email address may again be attempted for registration after authentication fails 3 times on the
          verification page.
        </p>
        <img src={ mxfactorial } className='center-block'
          style={ { marginTop: 20, marginBottom: 20 } } />
        <div className='error-message'>{ this.state.errorMessage }</div>
        <button type='submit' onClick={ this.createAccount } className='btn btn-info form-spacing btn-style'>
          Okay
        </button>
      </div>
    );
  }
}


CreateAccount10Body.contextTypes = {
  router: PropTypes.object
};

CreateAccount10Body.propTypes = {
  accountDetails: PropTypes.object,
  postCreateAccount: PropTypes.func.isRequired,
  reset: PropTypes.func
};

