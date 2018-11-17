import React from 'react'
import styled from 'styled-components'
import RemoveIcon from 'icons/RemoveIcon'

const RemoveButtonStyled = styled.button`
  background-color: transparent;
  border: none;
  outline: rgba(0, 0, 0, 0);
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  margin: 0 0 10px -10px;
  &:focus {
    outline: none;
  }
  &:hover {
    opacity: 1;
  }
`

const RemoveButton = props => (
  <RemoveButtonStyled {...props}>
    <RemoveIcon width={12} height={12} />
  </RemoveButtonStyled>
)

export default RemoveButton
