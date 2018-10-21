import styled from 'styled-components'

const Spacer = styled.div`
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
`

Spacer.defaultProps = {
  w: 0,
  h: 0
}

export default Spacer
