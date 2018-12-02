import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Text } from 'components/Typography'

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #efefef;
`

export const HistoryDetailHeader = () => (
  <HeaderContainer>
    <div data-id="backButton">
      <Link to={`/history`}>
        <i className="fa fa-arrow-left fa-lg" />
      </Link>
    </div>
    <div>
      <Text variant="medium" fontWeight="bold" style={{ color: '#efefef' }}>
        Detail
      </Text>
    </div>
    <div data-id="emailCopyButton">
      <i className="fa fa-envelope fa-lg" />
    </div>
  </HeaderContainer>
)

export default HistoryDetailHeader
