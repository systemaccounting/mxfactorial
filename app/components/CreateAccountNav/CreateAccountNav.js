import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default class CreateAccountNav extends React.Component {
  render() {
    return (
      <div className='createAccountNav'>
        <nav>
          <ul className='primary-nav'>
            <li className='left'>
              <Link to={ this.props.routerstep }>
                <button className='btn btn-default'>
                  <span className='glyphicon glyphicon-arrow-left'/>
                </button>
              </Link>
            </li>
            <li className='right'>
              <a href='#'>
                <button className='btn btn-default'>
                  <span className='glyphicon glyphicon-question-sign'/>
                </button>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

CreateAccountNav.propTypes = {
  routerstep: PropTypes.string
};
