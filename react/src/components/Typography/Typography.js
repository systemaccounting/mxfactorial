import styled from 'styled-components'

export const textAlign = ({ textAlign }) =>
  textAlign && `text-align: ${textAlign}`

export const sizeVariant = ({ variant }) => {
  const styleName = 'font-size'
  switch (variant) {
    case 'normal':
      return `${styleName}: 1rem`
    case 'medium':
      return `${styleName}: 1.5rem`
    case 'large':
      return `${styleName}: 2rem`
    default:
      break
  }
}

export const fontWeightVariant = ({ fontWeight }) => {
  let styleName = 'font-weight'
  switch (fontWeight) {
    case 'light':
      return `${styleName}: lighter`
    case 'medium':
      return `${styleName}: regular`
    case 'bold':
      return `${styleName}: bold`
    default:
      break
  }
}

export const Base = styled.div`
  margin: 0;
  color: #666;
  ${textAlign};
  ${fontWeightVariant};
`

const SmallBase = Base.withComponent('small')
export const Small = styled(SmallBase)`
  font-size: 0.65rem;
  display: block;
  line-height: 1.2;
`

const PBase = Base.withComponent('p')
export const P = styled(PBase)`
  margin: 0;
`

const TextBase = Base.withComponent('p')

export const Text = styled(TextBase)`
  margin: 0;
  ${sizeVariant};
`
