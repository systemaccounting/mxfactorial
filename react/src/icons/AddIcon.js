import React from 'react'
import PropTypes from 'prop-types'

const AddIcon = props => (
  <svg
    className={props.cssClass}
    width={props.width}
    height={props.height}
    viewBox="0 0 1024 1024"
  >
    <path
      fill="currentColor"
      d="M992 384h-352v-352c0-17.672-14.328-32-32-32h-192c-17.672 0-32 14.328-32 32v352h-352c-17.672 0-32 14.328-32 32v192c0 17.672 14.328 32 32 32h352v352c0 17.672 14.328 32 32 32h192c17.672 0 32-14.328 32-32v-352h352c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32z"
    />
  </svg>
)

AddIcon.propTypes = {
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number
}

AddIcon.defaultProps = {
  width: 18,
  height: 18
}

export default AddIcon
