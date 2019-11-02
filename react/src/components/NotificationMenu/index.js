import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { Manager, Reference, Popper } from 'react-popper'
import { noop } from 'utils'
import ClickAwayListener from '../ClickAwayListener'
import s from './NotificationMenu.module.css'

export default function NotificationMenu(props) {
  return (
    <Manager>
      <Reference>{props.renderTarget}</Reference>
      {props.isOpen && (
        <Popper placement={props.placement}>
          {({ ref, style, placement }) => (
            <ClickAwayListener onClickAway={props.onClose}>
              <div
                ref={ref}
                style={style}
                data-placement={placement}
                className={s.root}
              >
                <div className={s.menuHeader}>
                  <i className="fa fa-lg fa-flag" />
                  <button type="button" className={s.clearBtn}>
                    Clear all
                    <i className="fa fa-close" />
                  </button>
                </div>
                <ul className={s.menuList}>
                  <li className={cx(s.menuItem, s.menuItem_none)}>
                    No notifications yet
                  </li>
                </ul>
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
  placement: PropTypes.string
}

NotificationMenu.defaultProps = {
  onClose: noop,
  placement: 'top-start'
}
