import map from 'lodash/map';
import keys from 'lodash/keys';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Wrapper, Menu } from 'react-aria-menubutton';

import Flag from 'images/flag.png';
import './NotificationMenu.scss';

export default class NotificationMenu extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
  }

  handleSelection() {}

  handleClear(event) {
    event.preventDefault();
    this.props.clearAll();
  }

  renderNotifications() {
    const { notifications } = this.props;

    return map(notifications, (item, key) => (
      <Link to={ `/TransactionRequestDetail/${item.key}` } key={ key }>
        <li className='padding14'>
          <div>
            { item.sent }, { item.sender } requested
          </div>
          <div className='text-right'>
            { item.payload }
          </div>
        </li>
      </Link>
    ));
  }

  render() {
    const { notifications } = this.props;

    return (
      <Wrapper className='icon' onSelection={ this.handleSelection }>
        <Button className='notification--button'>
          <div className='flag_icon icon' style={ { marginRight: '10px' } }>
            <span>{ keys(notifications).length || null }</span><img src={ Flag }/>
          </div>
        </Button>
        <Menu className='notification--menu'>
          <ul>
            <a onClick={ this.handleClear } href='#'>
              <li className='text-right padding14'>
                Clear all <i className='circle-x'/>
              </li>
            </a>
            { this.renderNotifications() }
          </ul>
        </Menu>
      </Wrapper>
      );
  }
}

NotificationMenu.propTypes = {
  notifications: PropTypes.object,
  clearAll: PropTypes.func
};
