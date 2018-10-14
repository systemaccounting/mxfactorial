import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import BackIcon from 'icons/BackIcon'
import EmailIcon from 'icons/EmailIcon'
import { Text } from 'components/Typography'

const HeaderContainer = styled.div`
  width: 100%;
  // border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #efefef;
`

export const RequestHeader = () => (
  <HeaderContainer>
    <div>
      <Link to={`/requests`}>
        <BackIcon />
      </Link>
    </div>
    <div>
      <Text variant="medium">Request</Text>
    </div>
    <div>
      <EmailIcon />
    </div>
  </HeaderContainer>
)

export default RequestHeader
