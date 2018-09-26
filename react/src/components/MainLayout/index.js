import React from 'react'
import styled from 'styled-components'

import NavigationContainer from 'containers/NavigationContainer'
import TopNavigation from 'components/TopNavigation'
import MainWrapper from 'components/MainWrapper'

const MainLayoutWrapper = styled.div``

const MainLayout = ({ children }) => (
  <MainLayoutWrapper>
    <TopNavigation />
    <MainWrapper>{children}</MainWrapper>
    <NavigationContainer />
  </MainLayoutWrapper>
)

export default MainLayout
