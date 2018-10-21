import styled from 'styled-components'
import is from 'styled-is'

const Label = styled.label`
  color: #333;
  font-weight: bold;
  font-size: 1rem;
  ${is('hasError')`
    color: red;
  `};
`

export default Label
