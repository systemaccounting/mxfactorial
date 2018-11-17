import React from 'react'
import PropTypes from 'prop-types'

const BackIcon = ({ width, height }) => (
  <svg data-id="backIcon" width={width} height={height} viewBox="0 0 32 32">
    <path
      d="M10.273,5.009c0.444-0.444,1.143-0.444,1.587,0c0.429,0.429,0.429,1.143,0,1.571l-8.047,8.047h26.554  c0.619,0,1.127,0.492,1.127,1.111c0,0.619-0.508,1.127-1.127,1.127H3.813l8.047,8.032c0.429,0.444,0.429,1.159,0,1.587  c-0.444,0.444-1.143,0.444-1.587,0l-9.952-9.952c-0.429-0.429-0.429-1.143,0-1.571L10.273,5.009z"
      fill="currentColor"
    />
  </svg>
)

BackIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number
}
BackIcon.defaultProps = {
  width: 32,
  height: 32
}

export default BackIcon
