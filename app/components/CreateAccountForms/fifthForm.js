import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class fifthForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {

    const { fields: { date_of_birth, industry, occupation }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='date' className='form-control form-spacing text-center'
              { ...date_of_birth } required={ true } placeholder='Date of Birth*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...industry } placeholder='Industry' />
            <input type='text' className='form-control form-spacing text-center'
              { ...occupation } placeholder='Occupation' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

fifthForm.contextTypes = {
  router: PropTypes.object
};

fifthForm.propTypes = {
  submitProfileDetails: PropTypes.func,
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  nextRoute: PropTypes.string
};
