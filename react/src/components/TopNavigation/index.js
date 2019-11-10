import React, { useState } from 'react'
import cx from 'classnames'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import useNotifications from 'hooks/useNotifications'
import NotificationMenu from '../NotificationMenu'
import s from './TopNavigation.module.css'

const Wrapper = styled.div`
  display: flex;
  padding: 10px 0;
`

const NavItem = styled.div`
  color: #efefef;
  cursor: pointer;
  margin-right: 10px;
  color: #fff;
  opacity: 0.7;

  &:last-child: {
    margin-right: 0;
  }

  &:hover {
    opacity: 1;
  }

  i {
    color: inherit;
  }
`

const TopNavigation = () => {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications] = useNotifications()

  const openNotificationsMenu = () => setNotificationsOpen(true)
  const closeNotificationsMenu = () => setNotificationsOpen(false)

  const renderNotificationsTarget = ({ ref }) => {
    return (
      <div className={s.badgeWrapper}>
        <i
          className="fa fa-2x fa-flag"
          data-id="notificationButton"
          ref={ref}
          onClick={openNotificationsMenu}
        />
        {notifications.length && (
          <span className={s.badge}>{notifications.length}</span>
        )}
      </div>
    )
  }

  return (
    <ul className={s.root}>
      <li className={s.menuItem}>
        <Link to="/account" data-id="homeButton">
          <i className="fa fa-2x fa-home" />
        </Link>
      </li>
      <li
        className={cx(s.menuItem, { [s.menuItem_active]: isNotificationsOpen })}
      >
        <NotificationMenu
          renderTarget={renderNotificationsTarget}
          isOpen={isNotificationsOpen}
          onClose={closeNotificationsMenu}
          notifications={notifications}
        />
      </li>
    </ul>
  )
}

export default TopNavigation
