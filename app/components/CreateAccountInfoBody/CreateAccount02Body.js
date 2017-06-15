import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const CreateAccount02Body = (props) => {

  return (
    <div className='createAccount02Body'>
      <p style={ { textAlign: 'left' } }>
        Rather, the greatest threat to an economy comes by way of that fellow
        who wears a suit & tie everyday, has a family, <i>never touches the
        stuff</i>, and yet exploits the same absence of accountability to grant
        funds and fallacious degrees to anyone who will justify stealing the
        public's purchasing power through the printing of money, polluting its
        supply with default risk, and manipulating its borrowing cost so that
        capital may continue to be acquired after producing nothing.
      </p>
      <Link to={ props.nextRoute }>
        <button type='submit' style={ { marginTop: 20 } } className='btn form-spacing btn-style'>Next</button>
      </Link>
    </div>
  );
};

CreateAccount02Body.propTypes = {
  nextRoute: PropTypes.string
};

export default CreateAccount02Body;
