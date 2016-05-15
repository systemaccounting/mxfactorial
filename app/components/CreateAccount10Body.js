import React from 'react';
import { Link } from 'react-router';
import '../../static/images/mxfactorial.png';

export default class CreateAccount10Body extends React.Component {
  render() {
    return (
      <div className="createAccount10Body">
        <p style={{textAlign: 'left'}}>A verification email containing a 60 minute expiration was sent.</p>
        <p style={{textAlign: 'left'}}>After you select the URL sent in the verification email, verify your password on the resulting page to complete creation of an account with a demo balance of 1,000.</p>
        <p style={{textAlign: 'left'}}>An email address may again be attempted for registration after authentication fails 3 times on the verification page.</p>
        <img src='../../static/images/mxfactorial.png' className="center-block" style={{marginTop: 20, marginBottom: 20}} />
        <Link to="/"><button type="submit" className="btn btn-info form-spacing btn-style">Okay</button></Link>
      </div>
    );
  }
}