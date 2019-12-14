import React, { useState } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import useNotifications from 'hooks/useNotifications'
import NotificationMenu from '../NotificationMenu'
import s from './TopNavigation.module.css'

const TopNavigation = () => {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, clearNotifications] = useNotifications()

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
        {notifications.length > 0 && (
          <span className={s.badge} data-id="notificationsCounter">
            {notifications.length}
          </span>
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
          onClear={clearNotifications}
          notifications={notifications}
        />
      </li>
    </ul>
  )
}

export default TopNavigation
