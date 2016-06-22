import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import Flag from 'images/flag.png';
import Home from 'images/home.png';

import { Button, Wrapper, Menu } from 'react-aria-menubutton';

export default class Header extends Component {
  render() {
    const { handleSelection } = this.props;

    return (
      <div className='header'>
        <div className='home_icon icon' style={ { marginRight: '10px' } }><img src={ Home } alt=''/></div>
        <div className='flag_icon icon'><span>3</span><img src={ Flag }/></div>
        <div className='burger-menu padding14'>
          <Wrapper className='MyMenuButton' onSelection={ handleSelection }>
            <Button className='MyMenuButton-button'>
              <span className='glyphicon glyphicon-menu-hamburger'></span>
            </Button>
            <Menu className='MyMenuButton-menu'>
              <ul>
                <li className='text-left'><span className='glyphicon glyphicon-cog font22 padding14'></span></li>
                <li className='padding14'>Request</li>
                <Link to='/TransactionHistory'>
                  <li className='padding14'>History</li>
                </Link>
                <li className='padding14'>Rules</li>
                <li className='padding14'>Query</li>
                <li className='padding14'>Support</li>
                <li className='padding14'>Log out</li>
              </ul>
            </Menu>
          </Wrapper>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  handleSelection: PropTypes.func
};

Header.defaultProps = {
  handleSelection: () => {}
};
