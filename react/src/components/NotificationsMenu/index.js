import React from 'react'
import PropTypes from 'prop-types'
import { Manager, Reference, Popper } from 'react-popper'
import { noop } from 'utils'
import ClickAwayListener from '../ClickAwayListener'

export default function NotificationsMenu(props) {
  return (
    <Manager>
      <Reference>{props.renderTarget}</Reference>
      {props.isOpen && (
        <Popper placement={props.placement}>
          {({ ref, style, placement }) => (
            <ClickAwayListener onClickAway={props.onClose}>
              <div ref={ref} style={style} data-placement={placement}>
                Popper element
              </div>
            </ClickAwayListener>
          )}
        </Popper>
      )}
    </Manager>
  )
}

NotificationsMenu.propTypes = {
  renderTarget: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  placement: PropTypes.string
}

NotificationsMenu.defaultProps = {
  onClose: noop,
  placement: 'bottom-start'
}
