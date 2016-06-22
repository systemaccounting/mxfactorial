import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class fourthForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {

    const { fields: { telephone_country_code, telephone_area_code, telephone_number }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_country_code } placeholder='country dialing code*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_area_code } placeholder='area code*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_number } placeholder='phone number*' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}
fourthForm.contextTypes = {
  router: PropTypes.object
};

fourthForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitProfileDetails: PropTypes.func,
  nextRoute: PropTypes.string
};
