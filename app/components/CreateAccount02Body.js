import React from 'react';
import { Link } from 'react-router';

export default class CreateAccount02Body extends React.Component {
  render() {
    return (
      <div className="createAccount02Body">
        <p style={{textAlign: 'left'}}>Rather, the greatest threat to an economy comes by way of that fellow who wears a suit & tie everyday, ‘never touches the stuff’, has a family, and yet exploits the same absence of accountability to sell weapons to murderous criminals, raise the price of a life-saving drug 5,000%, and confers both funds and fallacious academic degrees upon anyone willing to justify theft of the public's purchasing power by printing money, polluting its supply with default risk, and maninpulating interest rates to 0% so that capital may continue to be acquired after producing nothing.</p>
        <Link to="/CreateAccount03"><button type="submit" style={{marginTop: 20}} className="btn form-spacing btn-style">Next</button></Link>
      </div>
    );
  }
}
