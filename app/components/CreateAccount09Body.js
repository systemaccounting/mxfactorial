import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount09Body extends React.Component {
  render() {
    return (
      <div className="createAccount09Body">
        <form role="form">
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="user_create" required placeholder="user*" />
            <input type="password" className="form-control form-spacing text-center" name="password_create" required placeholder="password*" />
            <input type="email" className="form-control form-spacing text-center" name="email_address_create" required placeholder="email*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount10"><button type="submit" className="btn btn-primary form-spacing btn-style">Create Account</button></Link>
          </div>
        </form>
      </div>
    );
  }
}