import React,{PropTypes} from 'react';
import { Link } from 'react-router';
import '../../static/images/mxfactorial.png';
import {createAccount} from '../actions/signUpActions'
import {connect} from 'react-redux'
class CreateAccount10Body extends React.Component {
    constructor(props){
        super(props)
        this.createAccount = this.createAccount.bind(this)
    }
    createAccount(){
            console.log(this.props.accountDetails)
    }
  render() {
    return (
      <div className="createAccount10Body">
        <p style={{textAlign: 'left'}}>A verification email containing a 60 minute expiration was sent.</p>
        <p style={{textAlign: 'left'}}>After you select the URL sent in the verification email, verify your password on the resulting page to complete creation of an account with a demo balance of 1,000.</p>
        <p style={{textAlign: 'left'}}>An email address may again be attempted for registration after authentication fails 3 times on the verification page.</p>
        <img src='../../static/images/mxfactorial.png' className="center-block" style={{marginTop: 20, marginBottom: 20}} />
        <button type="submit" onClick={this.createAccount} className="btn btn-info form-spacing btn-style">Okay</button>
      </div>
    );
  }
}
function mapStateToProps(state){
    return {
        accountDetails:state.accountDetails
    }
}
CreateAccount10Body.contextTypes = {
    router:PropTypes.object
}
export default connect(mapStateToProps,{createAccount})(CreateAccount10Body)
