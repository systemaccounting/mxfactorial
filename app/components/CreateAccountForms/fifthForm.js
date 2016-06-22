import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class fifthForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {

    const { fields: { date_of_birth, industry_name, occupation_name }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='date' className='form-control form-spacing text-center'
              { ...date_of_birth } required={ true } placeholder='Date of Birth*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...industry_name } placeholder='Industry' />
            <input type='text' className='form-control form-spacing text-center'
              { ...occupation_name } placeholder='Occupation' />
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
