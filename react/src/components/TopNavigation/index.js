import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import HomeIcon from 'icons/HomeIcon'

const Wrapper = styled.div`
  display: flex;
  padding: 10px 0;
`

const NavItem = styled.div`
  color: #efefef;
  > * {
    color: #efefef;
    text-decoration: none;
    &:hover {
      color: #e2e2e2;
    }
  }
`

const TopNavigation = () => (
  <Wrapper>
    <NavItem>
      <Link to="/account">
        <HomeIcon />
      </Link>
    </NavItem>
  </Wrapper>
)

export default TopNavigation
