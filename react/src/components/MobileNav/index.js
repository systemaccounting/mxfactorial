import React, { Component } from 'react'
import T from 'prop-types'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { testVars } from 'utils'
import s from './MobileNav.module.css'

class MobileNav extends Component {
  static propTypes = {
    signOut: T.func
  }

  static defaultProps = {
    signOut: null
  }

  componentDidMount() {
    // Prevent body scrolling
    document.body.classList.add(s.noScroll)
  }

  componentWillUnmount() {
    document.body.classList.remove(s.noScroll)
  }

  get testVariables() {
    if (!process.env.REACT_APP_TEST_ENV) {
      return null
    }
    return testVars.map(item => (
      <li
        className={cx(s.listItem, s.listItem_alt)}
        data-id="nav-menu-test-item"
        key={item}
      >
        {process.env[item]}
      </li>
    ))
  }

  render() {
    const { signOut } = this.props
    return (
      <div className={s.root}>
        <ul className={s.list} data-id="nav-menu">
          <li className={s.listItem} data-id="nav-menu-item">
            <Link to="/requests" data-id="requestsLink">
              Requests
            </Link>
          </li>
          <li className={s.listItem} data-id="nav-menu-item">
            <Link to="/history" data-id="historyLink">
              History
            </Link>
          </li>
          <li className={s.listItem} data-id="nav-menu-item">
            Rules
          </li>
          <li className={s.listItem} data-id="nav-menu-item">
            Query
          </li>
          <li className={s.listItem} data-id="nav-menu-item">
            Support
          </li>
          <li
            className={s.listItem}
            data-name="sign-out"
            data-id="nav-menu-item"
            onClick={signOut}
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
