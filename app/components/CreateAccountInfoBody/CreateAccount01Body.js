import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const CreateAccount01Body = (props) => {
  return (
    <div className='createAccount01Body'>
      <p style={ { textAlign: 'left' } }>
        While you are not required to publish the activity of your user, or even supply scientifically-accurate personal
        information for this demonstration, be mindful the data you supply here is intended to help demonstrate for the
        public how indispensable <strong>accountability</strong> is for a prosperous economy.
      </p>
      <p style={ { textAlign: 'left' } }>
        The greatest threat to an economy has nothing to do with those who exploit the absence of accountability to
        safely pursue whatever minor offenses are especially common amongst its youth.
      </p>
      <Link to={ props.nextRoute }>
        <button type='submit' style={ { marginTop: 20 } } className='btn form-spacing btn-style'>Next</button>
      </Link>
    </div>
  );
};

CreateAccount01Body.propTypes = {
  nextRoute: PropTypes.string
};

export default CreateAccount01Body;
