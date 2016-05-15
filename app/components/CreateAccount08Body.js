import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount08Body extends React.Component {
  render() {
    return (
      <div className="createAccount08Body">
        <form role="form">
          <div className="form-group">
            <input type="date" className="form-control form-spacing text-center" name="date_of_birth" required placeholder="Date of Birth*" />
            <input type="text" className="form-control form-spacing text-center" name="industry_name" placeholder="Industry" />
            <input type="text" className="form-control form-spacing text-center" name="occupation_name" placeholder="Occupation" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount09"><button type="submit" className="btn btn-primary form-spacing btn-style">Next</button></Link>
          </div>
        </form>
      </div>
    );
  }
}
