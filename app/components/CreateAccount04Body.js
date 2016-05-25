import React from 'react';
import { Link } from 'react-router';
import { Field, reduxForm } from 'redux-form'
export default class CreateAccount04Body extends React.Component {
  render() {
    return (
      <div className="createAccount04Body">
        <form role="form">
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="first_name" required placeholder="First Name*" />
            <input type="text" className="form-control form-spacing text-center" name="middle_name" required placeholder="Middle Name*" />
            <input type="text" className="form-control form-spacing text-center" name="last_name" required placeholder="Last Name*" />
            <input type="text" className="form-control form-spacing text-center" name="country_name" required placeholder="Country*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount05"><button type="submit" className="btn btn-primary form-spacing btn-style">Next</button></Link>
          </div>
        </form>
      </div>
    );
  }
}