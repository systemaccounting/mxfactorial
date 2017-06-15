import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class thirdForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {

    const { fields: { city, state, postal_code }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center' { ...city } placeholder='City*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...state } placeholder='State*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...postal_code } placeholder='postal code*' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

thirdForm.contextTypes = {
  router: PropTypes.object
};

thirdForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitProfileDetails: PropTypes.func,
  nextRoute: PropTypes.string
};
