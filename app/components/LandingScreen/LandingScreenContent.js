import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class LandingScreenContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const { nextPathName, login } = this.props;

    login({
      username: this.refs.username.value,
      password: this.refs.password.value
    }).then((action) => {
      if (action.payload.user) {
        let path = nextPathName || '/home';
        this.context.router.push(path);
      } else if (action.error) {
        this.setState({
          error: action.payload.message
        });
      }
    });
  }

  render() {
    return (
      <div>
        <form role='form' onSubmit={ this.handleSubmit }>
          <div className='form-group'>
            <input id='userInputField' ref='username' type='text' className='form-control form-spacing text-center'
              name='username' required={ true } placeholder='User' />
            <input id='passwordInputField' ref='password' type='password'
              className='form-control form-spacing text-center' name='password'
              required={ true } placeholder='Password' />
            <div className='error-message'>
              { this.state.error }
            </div>
            <button id='signInButton' type='submit'
              className='btn btn-info form-spacing btn-style'>Sign In</button>
            <Link to='/CreateAccountInfo/1'>
              <button id='createButton' type='button' className='btn btn-primary form-spacing btn-style'>Create</button>
            </Link>
          </div>
        </form>
        <div><p style={ { textAlign: 'center' } }><u><em><a href='#'>Forgot Password</a></em></u></p></div>
      </div>
    );
  }
}

LandingScreenContent.contextTypes = {
  router: PropTypes.object
};

LandingScreenContent.propTypes = {
  login: PropTypes.func,
  nextPathName: PropTypes.string
};
