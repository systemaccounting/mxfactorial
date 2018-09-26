import React from 'react'
import PropTypes from 'prop-types'

const SubtractIcon = props => (
  <svg
    className={props.cssClass}
    width={props.width}
    height={props.height}
    viewBox="0 0 1024 1024"
  >
    <path
      fill="currentColor"
      d="M0 416v192c0 17.672 14.328 32 32 32h960c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32h-960c-17.672 0-32 14.328-32 32z"
    />
  </svg>
)

SubtractIcon.propTypes = {
  cssClass: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number
}

SubtractIcon.defaultProps = {
  width: 18,
  height: 18
}

export default SubtractIcon
