import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class firstForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {
    const { fields: { first_name, last_name, middle_name, country }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...first_name } placeholder='First Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...middle_name } placeholder='Middle Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...last_name } placeholder='Last Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...country } placeholder='Country*' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

firstForm.contextTypes = {
  router: PropTypes.object
};

firstForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitProfileDetails: PropTypes.func,
  nextRoute: PropTypes.string
};
