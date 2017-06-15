import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class sixthForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitAuthDetails;
  }

  render() {

    const { fields: { account, password, email_address }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...account } placeholder='user*' />
            <input type='password' className='form-control form-spacing text-center'
              { ...password } placeholder='password*' />
            <input type='email' className='form-control form-spacing text-center'
              { ...email_address } placeholder='email*' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

sixthForm.contextTypes = {
  router: PropTypes.object
};

sixthForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitAuthDetails: PropTypes.func,
  nextRoute: PropTypes.string
};
