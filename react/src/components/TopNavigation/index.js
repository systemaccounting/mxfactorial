import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import NotificationsMenu from '../NotificationsMenu'

const Wrapper = styled.div`
  display: flex;
  padding: 10px 0;
`

const NavItem = styled.div`
  color: #efefef;
  cursor: pointer;
  margin-right: 10px;

  &:last-child: {
    margin-right: 0;
  }

  i {
    color: #efefef;
    text-decoration: none;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
`

const TopNavigation = () => {
  const [isNotificationsMenuOpen, setNotificationsMenu] = useState(false)

  const openNotificationsMenu = () => setNotificationsMenu(true)
  const closeNotificationsMenu = () => setNotificationsMenu(false)

  const renderNotificationsTarget = ({ ref }) => {
    return <i className="fa fa-2x fa-flag" ref={ref} />
  }

  return (
    <Wrapper>
      <NavItem>
        <Link to="/account" data-id="homeButton">
          <i className="fa fa-2x fa-home" />
        </Link>
      </NavItem>
      <NavItem onClick={openNotificationsMenu}>
        <NotificationsMenu
          renderTarget={renderNotificationsTarget}
          isOpen={isNotificationsMenuOpen}
          onClose={closeNotificationsMenu}
        />
      </NavItem>
    </Wrapper>
  )
}

export default TopNavigation
