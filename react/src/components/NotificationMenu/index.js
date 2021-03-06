import React, { useCallback } from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { Manager, Reference, Popper } from 'react-popper'
import { NotificationType } from 'types'
import { noop } from 'utils'
import { fromNow } from 'utils/date'
import ClickAwayListener from '../ClickAwayListener'
import s from './NotificationMenu.module.css'

export default function NotificationMenu(props) {
  const { notifications, onClear, onClose } = props

  const renderNotifications = useCallback(() => {
    if (!notifications.length) {
      return (
        <li
          className={cx(s.menuItem, s.menuItem_none)}
          data-id="notificationsMenuItem"
        >
          No notifications yet
        </li>
      )
    }
    return notifications.map(item => (
      <li
        className={s.menuItem}
        key={item.uuid}
        data-id="notificationsMenuItem"
      >
        <span className={s.when}>{fromNow(item.human_timestamp)}</span>
        <div className={s.menuItemWrapper}>
          <span>{item.contraAccount}</span>
          <span>{item.totalPrice}</span>
        </div>
      </li>
    ))
  }, [notifications])

  const clearNotifications = useCallback(() => {
    onClear()
    onClose()
  }, [onClear, onClose])

  return (
    <Manager>
      <Reference>{props.renderTarget}</Reference>
      {props.isOpen && (
        <Popper placement={props.placement}>
          {({ ref, style, placement }) => (
            <ClickAwayListener onClickAway={onClose}>
              <div
                ref={ref}
                style={style}
                data-placement={placement}
                data-id="notificationsMenu"
                className={s.root}
              >
                <div className={s.menuHeader}>
                  <button
                    type="button"
                    className={s.clearBtn}
                    onClick={clearNotifications}
                    data-id="notificationsClear"
                  >
                    Clear all
                    <i className="fa fa-close" />
                  </button>
                </div>
                <ul className={s.menuList}>{renderNotifications()}</ul>
              </div>
            </ClickAwayListener>
          )}
        </Popper>
      )}
    </Manager>
  )
}

NotificationMenu.propTypes = {
  renderTarget: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onClear: PropTypes.func,
  placement: PropTypes.string,
  notifications: PropTypes.arrayOf(NotificationType)
}

NotificationMenu.defaultProps = {
  notifications: [],
  onClose: noop,
  onClear: noop,
  placement: 'top-start'
}
