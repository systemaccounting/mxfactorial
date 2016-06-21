import React, { Component ,PropTypes} from 'react'
import { reduxForm } from 'redux-form'

import { submitProfileDetails } from '../../actions/signUpActions';

import { Link ,Router} from 'react-router'


class thirdForm extends Component {

  onSubmit(props){
    this.props.submitProfileDetails(props);
    this.context.router.push(this.props.nextRoute)
  }

  render () {

    const {fields:{city_name, state_name, postal_code}, handleSubmit} = this.props

    return (
      <div className="createAccount04Body">
        <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" {...city_name} placeholder="City*" />
            <input type="text" className="form-control form-spacing text-center"  {...state_name} placeholder="State*" />
            <input type="text" className="form-control form-spacing text-center"  {...postal_code} placeholder="postal code*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
          </div>
        </form>
      </div>
    )
  }
}

thirdForm.contextTypes = {
  router: PropTypes.object
}

export default reduxForm({
  form: 'thirdForm',
  fields: [
    'city_name', 'state_name', 'postal_code'
  ],
  destroyOnUnmount:false
}, null, {submitProfileDetails})(thirdForm)
