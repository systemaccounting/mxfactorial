import React, { Component ,PropTypes} from 'react'
import { reduxForm } from 'redux-form'

import { Link ,Router} from 'react-router'
import {submitProfileDetails} from '../../actions/signUpActions'
class firstForm extends Component {

    onSubmit(props){
        this.props.submitProfileDetails(props)
        this.context.router.push('/createAccount05')
    }

    render () {

        const {fields:{first_name, last_name, middle_name,country_name}, handleSubmit} = this.props

        return (
            <div className="createAccount04Body">
                    <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                        <div className="form-group">
                            <input type="text" className="form-control form-spacing text-center" {...first_name}  placeholder="First Name*" />
                            <input type="text" className="form-control form-spacing text-center" {...middle_name}  placeholder="Middle Name*" />
                            <input type="text" className="form-control form-spacing text-center" {...last_name}  placeholder="Last Name*" />
                            <input type="text" className="form-control form-spacing text-center" {...country_name}  placeholder="Country*" />
                            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
                           <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
                        </div>
                    </form>
            </div>
        )
    }
}
firstForm.contextTypes = {
    router:PropTypes.object
}
function validate (values) {
    let errors          = {}

    if (!values.title) {
        errors.title      = 'Enter a username'
    }
    if (!values.categories) {
        errors.categories = 'Enter categories'
    }
    if (!values.content) {
        errors.content    = 'Please enter contet'
    }

    return errors
}

export default reduxForm({
    form: 'firstForm',
    fields: [
        'first_name', 'last_name', 'middle_name','country_name'
    ],
    destroyOnUnmount:false
    }, null,{submitProfileDetails})(firstForm)
