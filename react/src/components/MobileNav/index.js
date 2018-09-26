import React from 'react'
import styled from 'styled-components'
import { navigate } from '@reach/router'

export const List = styled.ul`
  margin: 1rem 1rem 1rem 0;
  padding: 0;
  list-style-type: none;
  float: right;
  position: fixed;
  right: 0.5rem;
  bottom: 6rem;
  z-index: 100;
`

export const ListItem = styled.li`
  padding: 0.5rem;
  margin: 0.4rem 0.2rem;
  font-size: 1.2rem;
  color: rgb(115, 162, 194);
  background-color: white;
  border-style: solid;
  border-width: 0.5px;
  border-radius: 3px;
  border-color: rgb(236, 236, 240);
  text-align: right;
  box-shadow: -7px 7px 9px 1px rgba(92, 92, 95, 0.3);
  cursor: pointer;
`

const MobileNav = ({ signOut }) => {
  return (
    <List data-id="nav-menu">
      <ListItem data-id="nav-menu-item" onClick={() => navigate('/requests')}>
        Requests
      </ListItem>
      <ListItem data-id="nav-menu-item" onClick={() => navigate('/history')}>
        History
      </ListItem>
      <ListItem data-id="nav-menu-item">Rules</ListItem>
      <ListItem data-id="nav-menu-item">Query</ListItem>
      <ListItem data-id="nav-menu-item">Support</ListItem>
      <ListItem data-name="sign-out" data-id="nav-menu-item" onClick={signOut}>
        Sign Out
      </ListItem>
    </List>
  )
}

export default MobileNav
