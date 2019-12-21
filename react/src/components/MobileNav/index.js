import React, { Component } from 'react'
import T from 'prop-types'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { getTestVars, noop } from 'utils'
import s from './MobileNav.module.css'

function renderItem(itemKey) {
  if (!process.env[itemKey]) {
    return null
  }
  switch (itemKey) {
    case 'REACT_APP_TEST_BUILD_NUMBER':
      return (
        <a
          href={process.env.REACT_APP_BUILD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Build {process.env[itemKey]}
        </a>
      )
    default:
      return `${process.env[itemKey]}`
  }
}

class MobileNav extends Component {
  static propTypes = {
    signOut: T.func,
    onClose: T.func
  }

  static defaultProps = {
    signOut: noop,
    onClose: noop
  }

  componentDidMount() {
    // Prevent body scrolling
    document.body.classList.add(s.noScroll)
  }

  componentWillUnmount() {
    document.body.classList.remove(s.noScroll)
  }

  get testVariables() {
    if (!process.env.REACT_APP_HOST_ENV) {
      return null
    }
    return getTestVars().map(item => {
      return (
        <li
          className={cx(s.listItem, s.listItem_alt)}
          data-id="nav-menu-test-item"
          key={item}
        >
          {renderItem(item)}
        </li>
      )
    })
  }

  onSignOut = () => {
    this.props.onClose()
    this.props.signOut()
  }

  render() {
    const { onClose } = this.props
    return (
      <div className={s.root}>
        <ul className={s.list} data-id="nav-menu">
          <li className={s.listItem} onClick={onClose} data-id="nav-menu-item">
            <Link to="/requests" data-id="requestsLink">
              Requests
            </Link>
          </li>
          <li className={s.listItem} onClick={onClose} data-id="nav-menu-item">
            <Link to="/history" data-id="historyLink">
              History
            </Link>
          </li>
          <li className={s.listItem} onClick={onClose} data-id="nav-menu-item">
            Rules
          </li>
          <li className={s.listItem} onClick={onClose} data-id="nav-menu-item">
            Query
          </li>
          <li className={s.listItem} onClick={onClose} data-id="nav-menu-item">
            Support
          </li>
          <li
            className={s.listItem}
            data-name="sign-out"
            data-id="nav-menu-item"
            onClick={this.onSignOut}
          >
            Sign Out
          </li>
          {this.testVariables}
        </ul>
      </div>
    )
  }
}

export default MobileNav
