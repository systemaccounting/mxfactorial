import React, { Component, PropTypes} from 'react'
import { reduxForm } from 'redux-form'

import { submitProfileDetails } from '../../actions/signUpActions';

import { Link, Router} from 'react-router'


class fourthForm extends Component {

  onSubmit(props){
    this.props.submitProfileDetails(props);
    this.context.router.push(this.props.nextRoute)
  }

  render () {

    const { fields: {
              telephone_country_code, telephone_area_code, telephone_number
            },
            handleSubmit
          } = this.props

    return (
      <div className="createAccount04Body">
        <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" {...telephone_country_code} placeholder="country dialing code*" />
            <input type="text" className="form-control form-spacing text-center" {...telephone_area_code}  placeholder="area code*" />
            <input type="text" className="form-control form-spacing text-center" {...telephone_number}  placeholder="phone number*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
          </div>
        </form>
      </div>
    )
  }
}

fourthForm.contextTypes = {
  router:PropTypes.object
}

export default reduxForm({
  form: 'fourthForm',
  fields: [
    'telephone_country_code', 'telephone_area_code', 'telephone_number'
  ],
  destroyOnUnmount:false
}, null, {submitProfileDetails})(fourthForm)
