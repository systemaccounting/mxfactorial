import React, { Component ,PropTypes} from 'react'
import { reduxForm } from 'redux-form'

import { Link ,Router} from 'react-router'
import {submitProfileDetails} from '../../actions/signUpActions'
class fifthForm extends Component {

    onSubmit(props){
        this.props.submitProfileDetails(props)
        this.context.router.push('/createAccount09')
    }

    render () {

        const {fields:{date_of_birth,
            industry_name,
            occupation_name}, handleSubmit} = this.props

        return (
            <div className="createAccount04Body">
                <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <div className="form-group">
                        <input type="date" className="form-control form-spacing text-center" {...date_of_birth} required placeholder="Date of Birth*" />
                        <input type="text" className="form-control form-spacing text-center" {...industry_name} placeholder="Industry" />
                        <input type="text" className="form-control form-spacing text-center" {...occupation_name} placeholder="Occupation" />
                        <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
                        <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
                    </div>
                </form>
            </div>
        )
    }
}
fifthForm.contextTypes = {
    router:PropTypes.object
}

export default reduxForm({
    form: 'fifthForm',
    fields: [
        'date_of_birth', 'industry_name', 'occupation_name'
    ],
    destroyOnUnmount:false
}, null,{submitProfileDetails})(fifthForm)
