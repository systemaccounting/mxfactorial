import React, { useCallback } from 'react'

import ButtonGroup from 'components/ButtonGroup'
import Button from 'components/Button'
import AddIcon from 'icons/AddIcon'
import SubtractIcon from 'icons/SubtractIcon'

const TypeSwitch = ({ onSwitch, active }) => (
  <ButtonGroup active={active} onUpdate={onSwitch}>
    <React.Fragment>
      <Button
        name="debit"
        type="button"
        data-active={active === 'debit'}
        inactive={active !== 'debit'}
        onClick={onSwitch('debit')}
      >
        <SubtractIcon /> debit
      </Button>
      <Button
        name="credit"
        type="button"
        data-active={active === 'credit'}
        inactive={active !== 'credit'}
        onClick={onSwitch('credit')}
      >
        credit <AddIcon />
      </Button>
    </React.Fragment>
  </ButtonGroup>
)

export const TypeSwitchField = ({ input }) => {
  const onChange = useCallback(type => () => input.onChange(type), [input])
  return <TypeSwitch active={input.value} onSwitch={onChange} />
}

export default TypeSwitch
