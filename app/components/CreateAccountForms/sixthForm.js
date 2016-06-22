import React, { Component, PropTypes} from 'react'
import { reduxForm } from 'redux-form'

import { Link ,Router} from 'react-router'
import {submitAuthDetails} from '../../actions/signUpActions'
class sixthForm extends Component {

    onSubmit(props){
        this.props.submitAuthDetails(props)
        this.context.router.push(this.props.nextRoute)
    }

    render () {

        const {fields:{user_create, password_create, email_address_create}, handleSubmit} = this.props

        return (
            <div className="createAccount04Body">
                <form role="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <div className="form-group">
                        <input type="text" className="form-control form-spacing text-center"  {...user_create}  placeholder="user*" />
                        <input type="password" className="form-control form-spacing text-center" {...password_create}  placeholder="password*" />
                        <input type="email" className="form-control form-spacing text-center" {...email_address_create}  placeholder="email*" />
                        <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
                        <button type="submit" className="btn btn-primary form-spacing btn-style">Next</button>
                    </div>
                </form>
            </div>
        )
    }
}
sixthForm.contextTypes = {
    router:PropTypes.object
}

export default reduxForm({
    form: 'sixthForm',
    fields: [
        'user_create', 'password_create', 'email_address_create'
    ],
    destroyOnUnmount:false
}, null,{submitAuthDetails})(sixthForm)
