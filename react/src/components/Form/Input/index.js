import styled from 'styled-components'

const Input = styled.input`
  width: 100%;
  text-align: center;
  border-radius: 3px;
  margin-bottom: 1rem;
  height: 2.5rem;
  outline: none;
  border: none;
  font-size: 1.5rem;
  box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
  background-color: white;
  cursor: text;
  &:focus {
    color: rgb(131, 131, 131);
  }
  &:focus::-webkit-input-placeholder {
    color: transparent;
  }
`

export default Input
