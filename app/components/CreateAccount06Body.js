import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount06Body extends React.Component {
  render() {
    return (
      <div className="createAccount06Body">
        <form role="form">
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="city_name" required placeholder="City*" />
            <input type="text" className="form-control form-spacing text-center" name="state_name" required placeholder="State*" />
            <input type="text" className="form-control form-spacing text-center" name="postal_code" required placeholder="postal code*" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount07"><button type="submit" className="btn btn-primary form-spacing btn-style">Next</button></Link>
          </div>
        </form>
      </div>
    );
  }
}