import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount05Body extends React.Component {
  render() {
    return (
      <div className="createAccount05Body">
        <form role="form">
          <div className="form-group">
            <input type="text" className="form-control form-spacing text-center" name="street_number" required placeholder="Street Number*" />
            <input type="text" className="form-control form-spacing text-center" name="street_name" required placeholder="Street Name*" />
            <input type="text" className="form-control form-spacing text-center" name="floor_number"  placeholder="Floor Number" />
            <input type="text" className="form-control form-spacing text-center" name="unit_number" required placeholder="Unit" />
            <Link to="/"><button type="submit" className="btn form-spacing btn-style">Start Over</button></Link>
            <Link to="/CreateAccount06"><button type="submit" className="btn btn-primary form-spacing btn-style">Next</button></Link>
          </div>
        </form>
      </div>
    );
  }
}