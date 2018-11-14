import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  display: flex;
  padding: 10px 0;
`

const NavItem = styled.div`
  color: #444;
  > * {
    color: #efefef;
    text-decoration: none;
    &:hover {
      color: #222;
    }
  }
`

const TopNavigation = () => (
  <Wrapper>
    <NavItem>
      <Link to="/account">
        <i className="fa fa-2x fa-home" />
      </Link>
    </NavItem>
  </Wrapper>
)

export default TopNavigation
