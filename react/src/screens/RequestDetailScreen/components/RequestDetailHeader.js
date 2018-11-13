import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import BackIcon from 'icons/BackIcon'
import EmailIcon from 'icons/EmailIcon'
import { Text } from 'components/Typography'

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #444;
`

export const RequestDetailHeader = () => (
  <HeaderContainer>
    <div data-id="backButton">
      <Link to={`/requests`}>
        <i className="fa fa-arrow-left fa-lg" />
      </Link>
    </div>
    <div>
      <Text variant="medium">Request</Text>
    </div>
    <div data-id="emailCopyButton">
      <i className="fa fa-envelope fa-lg" />
    </div>
  </HeaderContainer>
)

export default RequestDetailHeader
