import map from 'lodash/map';
import keys from 'lodash/keys';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';

import TimeAgo from 'components/TimeAgo';
import Flag from 'images/flag.png';
import chronologicalNotificationSort from 'utils/chronologicalNotificationSort';
import './NotificationMenu.scss';

export default class NotificationMenu extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
    this.handleReadOne = this.handleReadOne.bind(this);
  }

  handleSelection() {}

  handleClear(event) {
    event.preventDefault();
    const { notifications, clearAll } = this.props;

    clearAll(keys(notifications));

  }

  handleReadOne(key) {
    this.props.readOne(key);
  }

  renderNotifications() {
    const { notifications } = this.props;
    if (notifications && keys(notifications).length) {
      const sortedNotifications = chronologicalNotificationSort(notifications);

      return map(sortedNotifications, (item, key) => (
        <MenuItem key={ item.id }>
          <Link
            className='notification--item-link'
            to={ `/TransactionRequestDetail/${item.key}` }
            onClick={ this.handleReadOne.bind(this, item.id) }>
            <li className='padding14'>
              <div>
                <TimeAgo time={ item.sent_time }/>, { item.sender_account } requested
              </div>
              <div className='text-right'>
                { item.payload && item.payload.total.toFixed(3) || 0 }
              </div>
            </li>
          </Link>
        </MenuItem>
      ));
    } else {
      return (
        <li className='padding14'>
          <div className='text-center'>
            (empty)
          </div>
        </li>
      );
    }
  }

  render() {
    const { notifications } = this.props;
    const numOfNotifications = keys(notifications).length;

    return (
      <Wrapper className='icon' onSelection={ this.handleSelection }>
        <Button className='notification--button'>
          <div className='flag_icon icon' style={ { marginRight: '10px' } }>
            <span>{ numOfNotifications || null }</span><img src={ Flag }/>
          </div>
        </Button>
        <Menu className='notification--menu'>
          <ul>
            <MenuItem>
              <a onClick={ this.handleClear } href='#' className='clearAllButton'>
                <li className='text-right padding14'>
                  Clear all <i className='circle-x'/>
                </li>
              </a>
            </MenuItem>
            { this.renderNotifications() }
          </ul>
        </Menu>
      </Wrapper>
      );
  }
}

NotificationMenu.propTypes = {
  notifications: PropTypes.object,
  clearAll: PropTypes.func,
  readOne: PropTypes.func
};
