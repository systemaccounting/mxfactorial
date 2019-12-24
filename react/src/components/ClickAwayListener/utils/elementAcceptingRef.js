import PropTypes from 'prop-types'
import chainPropTypes from './chainPropTypes'

function isClassComponent(elementType) {
  // elementType.prototype?.isReactComponent
  const { prototype = {} } = elementType

  return Boolean(prototype.isReactComponent)
}

function acceptingRef(props, propName, componentName, location, propFullName) {
  const element = props[propName]
  const safePropName = propFullName || propName

  if (element == null) {
    return null
  }

  let warningHint

  const elementType = element.type

  if (typeof elementType === 'function' && !isClassComponent(elementType)) {
    warningHint =
      'Did you accidentally use a plain function component for an element instead?'
  }

  if (warningHint !== undefined) {
    return new Error(
      `Invalid ${location} \`${safePropName}\` supplied to \`${componentName}\`. Expected an element that can hold a ref. ${warningHint}`
    )
  }

  return null
}

const elementAcceptingRef = chainPropTypes(PropTypes.element, acceptingRef)
elementAcceptingRef.isRequired = chainPropTypes(
  PropTypes.element.isRequired,
  acceptingRef
)

export default elementAcceptingRef
