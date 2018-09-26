import styled from 'styled-components'

export const textAlign = ({ textAlign }) =>
  textAlign && `text-align: ${textAlign}`

export const sizeVariant = ({ variant }) => {
  let fontSize = 'font-size'
  switch (variant) {
    case 'normal':
      return `${fontSize}: 1rem`
    case 'medium':
      return `${fontSize}: 1.5rem`
    case 'large':
      return `${fontSize}: 2rem`
    default:
      break
  }
}

export const Base = styled.div`
  margin-bottom: 0;
  ${textAlign};
`

const SmallBase = Base.withComponent('small')
export const Small = styled(SmallBase)`
  font-size: 0.65rem;
  display: block;
  line-height: 1.2;
`

const PBase = Base.withComponent('p')
export const P = styled(PBase)`
  margin-bottom: 0;
`

const TextBase = Base.withComponent('p')

export const Text = styled(TextBase)`
  ${sizeVariant};
`
