import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount07Body extends React.Component {
  render() {
    return (
      <div className="createAccount07Body">
        <form role="form">
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="telephone_country_code" required placeholder="country dialing code*" />
            <input type="text" className="form-control form-spacing text-center" name="telephone_area_code" required placeholder="area code*" />
            <input type="text" className="form-control form-spacing text-center" name="telephone_number" required placeholder="phone number*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount08"><button type="submit" className="btn btn-primary form-spacing btn-style">Next</button></Link>
          </div>
        </form>
      </div>
    );
  }
}