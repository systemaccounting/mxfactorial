import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount03Body extends React.Component {
  render() {
    return (
      <div className="createAccountBody03">
        <p style={{textAlign: 'left'}}>While the former is to receive patience & compassion, the latter is to receive our swift justice.</p>
        <p style={{textAlign: 'left'}}>Our weapon is scientific truth, and by accepting these Terms of Use you agree to take up arms with us:</p>
        <p style={{textAlign: 'center', marginBottom: 20}}><strong>Ye shall do no unrighteousness in judgment, in meteyard, in weight, or in measure.</strong></p>
        <Link to="/CreateAccount04"><button type="submit" className="btn btn-primary form-spacing btn-style">I Accept</button></Link>
      </div>
    );
  }
}