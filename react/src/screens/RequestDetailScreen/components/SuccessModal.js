import React from 'react'
import styled from 'styled-components'
import { Flex } from '@rebass/grid'

import { logo } from 'assets'
import Spacer from 'components/Spacer'
import ButtonLink from 'components/ButtonLink'

const SuccessModalStyled = styled.div`
  border-radius: 10px;
  background-color: #d9ead3;
  width: 100%;
  max-width: 20rem;
  padding: 16px;
  ${Flex} {
    > a {
      width: 100%;
    }
  }
`

const LogoContainer = styled.div`
  width: 100%;
  img {
    width: 100%;
  }
`

const SuccessModal = () => (
  <SuccessModalStyled data-id="transactionSuccessPopup">
    <LogoContainer>
      <img src={logo} alt="logo" />
    </LogoContainer>
    <Flex>
      <ButtonLink data-id="newButton" to={`/account`} text="New" />
      <Spacer w={10} />
      <ButtonLink data-id="okButton" to={`/history`} text="OK" />
    </Flex>
  </SuccessModalStyled>
)

export default SuccessModal
