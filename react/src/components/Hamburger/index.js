import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import is from 'styled-is'
import Button from 'components/Button'

const Wrapper = styled(Button)`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  outline: none;
  padding: 0;
  &:focus {
    outline: none;
  }
  span {
    position: absolute;
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background-color: white;
    left: 12px;
    opacity: 1;
    transition: 0.2s;
  }
  span:nth-child(1) {
    top: 20px;
    ${is('active')`
      top: 30px;
      transform: rotate(45deg);
    `};
  }
  span:nth-child(2) {
    top: 30px;
    ${is('active')`
      opacity: 0;
    `};
  }
  span:nth-child(3) {
    top: 40px;
    ${is('active')`
      top: 31px;
      transform: rotate(-45deg);
    `};
  }
`

const Hamburger = props => (
  <Wrapper {...props}>
    <span />
    <span />
    <span />
  </Wrapper>
)

Hamburger.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func
}

export default Hamburger
