import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import { logo } from '../../assets'

const HeaderStyled = styled.div`
  height: 12rem;
  padding-top: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  a {
    height: 100%;
  }
  img {
    height: 100%;
  }
`

const Header = () => (
  <HeaderStyled>
    <Link to="/auth" className="create-account-logo-link">
      <img src={logo} className="create-account-logo" alt="logo" />
    </Link>
  </HeaderStyled>
)

export default Header
