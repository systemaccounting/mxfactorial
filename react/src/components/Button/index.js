import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import is from 'styled-is'
import themes from './themes'

export const ButtonBase = styled.button`
  width: 100%;
  text-align: center;
  padding: 0;
  border-radius: 3px;
  margin-bottom: 1rem;
  height: 2.5rem;
  outline: none;
  border: none;
  font-size: 1.5rem;
  box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    margin: 0 5px;
  }
  &:focus {
    outline: none;
  }
  ${({ theme }) => theme};
  ${is('disabled')`
    opacity: 0.5;
    cursor: not-allowed;
  `};
  ${is('inactive')`
    background-color: rgb(202, 201, 201) !important;
    color: rgb(238, 235, 235);
  `};
`

const Button = ({ theme, ...rest }) => (
  <ButtonBase {...rest} theme={themes[theme]} />
)

Button.propTypes = {
  theme: PropTypes.string,
  inactive: PropTypes.bool
}

Button.defaultProps = {
  theme: 'primary',
  inactive: false
}

export default Button
