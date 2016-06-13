import React,{PropTypes} from 'react';
import { Link } from 'react-router';
import '../../../static/images/mxfactorial.png';
import {createAccount} from '../../actions/signUpActions';
import {connect} from 'react-redux';

import {
    SUBMIT_PROFILE_DETAILS,
    SUBMIT_AUTH_DETAILS,
    CREATE_ACCOUNT,
    BASE_URL
} from '../../constants/index'


class CreateAccount10Body extends React.Component {
    constructor(props) {
        super(props)
        this.createAccount = this.createAccount.bind(this)
    }
    createAccount() {
        var curContext = this;
        var postObject = {};
        console.log(this.props.accountDetails.account.auth)
        var auth = this.props.accountDetails.account.auth;
        var profile = this.props.accountDetails.account.profile;
        for (var prop in auth) {
            postObject[prop] = auth[prop];
        }
        for (var prop in profile) {
            postObject[prop] = profile[prop];
        }
        $.post(BASE_URL + "/users",
            postObject,
            function (data, status) {
                curContext.context.router.push('/');
            }, "json").fail(function (xhr) { alert(xhr.responseText); });

    }
    render() {
        return (
            <div className="createAccount10Body">
                <p style={{ textAlign: 'left' }}>A verification email containing a 60 minute expiration was sent.</p>
                <p style={{ textAlign: 'left' }}>After you select the URL sent in the verification email, verify your password on the resulting page to complete creation of an account with a demo balance of 1, 000.</p>
                <p style={{ textAlign: 'left' }}>An email address may again be attempted for registration after authentication fails 3 times on the verification page.</p>
                <img src='../../static/images/mxfactorial.png' className="center-block" style={{ marginTop: 20, marginBottom: 20 }} />
                <button type="submit" onClick={this.createAccount} className="btn btn-info form-spacing btn-style">Okay</button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        accountDetails: state.accountDetails
    }
}

CreateAccount10Body.contextTypes = {
    router: PropTypes.object
}

export default connect(mapStateToProps, { createAccount })(CreateAccount10Body)
