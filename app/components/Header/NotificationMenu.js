import map from 'lodash/map';
import keys from 'lodash/keys';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';
import numeral from 'numeral';

import TimeAgo from 'components/TimeAgo';
import Flag from 'images/flag.png';
import chronologicalNotificationSort from 'utils/chronologicalNotificationSort';
import { MONEY_FORMAT } from 'constants/index';
import './NotificationMenu.scss';

export default class NotificationMenu extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
  }

  handleSelection() {}

  handleClear(event) {
    event.preventDefault();
    const { notifications, clearAll } = this.props;

    clearAll(keys(notifications));

  }

  renderNotifications() {
    const { notifications } = this.props;
    if (notifications && keys(notifications).length) {
      const sortedNotifications = chronologicalNotificationSort(notifications);

      return map(sortedNotifications, (item, key) => (
        <MenuItem key={ item.id }>
          <Link
            className='notification--item-link'
            to={ `/TransactionRequestDetail/${item.key}` }>
            <li className='padding14'>
              <div>
                <TimeAgo time={ item.sent_time }/>, { item.sender_account } requested
              </div>
              <div className='text-right'>
                { numeral(item.payload
                  && item.payload.total * (item.payload.direction || 1)
                  || 0).format(MONEY_FORMAT) }
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
  clearAll: PropTypes.func
};
