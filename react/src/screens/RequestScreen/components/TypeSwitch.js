import React from 'react'

import ButtonGroup from 'components/ButtonGroup'
import Button from 'components/Button'

const TypeSwitch = ({ onSwitch, active }) => (
  <ButtonGroup active={active} onUpdate={onSwitch}>
    <React.Fragment>
      <Button
        name="rejected"
        data-id="rejectedButton"
        data-active={active === 'rejected'}
        inactive={active !== 'rejected'}
        onClick={onSwitch('rejected')}
      >
        rejected
      </Button>
      <Button
        name="active"
        data-id="activeButton"
        data-active={active === 'active'}
        inactive={active !== 'active'}
        onClick={onSwitch('active')}
      >
        active
      </Button>
    </React.Fragment>
  </ButtonGroup>
)

export default TypeSwitch
