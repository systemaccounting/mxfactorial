import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  display: flex;
  padding: 10px 0;
`

const NavItem = styled.div`
  color: #efefef;
  > * {
    color: #efefef;
    text-decoration: none;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
`

const TopNavigation = () => (
  <Wrapper>
    <NavItem>
      <Link to="/account" data-id="homeButton">
        <i className="fa fa-2x fa-home" />
      </Link>
    </NavItem>
  </Wrapper>
)

export default TopNavigation
