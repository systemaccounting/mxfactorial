import React from 'react'
import PropTypes from 'prop-types'

const RenderByStep = ({ step, children }) => (
  <React.Fragment>
    {React.Children.map(children, (child, i) => {
      if (i === step) return child
    })}
  </React.Fragment>
)

RenderByStep.defaultProps = {
  step: 0
}

RenderByStep.propTypes = {
  step: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}

export default RenderByStep
