import React from 'react'
import { shallow } from 'enzyme'
import TermOfUse, { TermsOfUseButton } from '../TermsOfUse'

const data = {
  label: 'Next',
  content: [
    [
      'While you are not required to publish the activity of your user,',
      'or even supply scientifically-accurate personal information for this',
      'demonstration, be mindful the data you supply here is intended to help',
      'demonstrate for the public how indispensable &nbsp;',
      '<strong>accountability</strong> is for a prosperous economy.'
    ],
    [
      'The greatest human threat to an economy has little to do with those',
      'who exploit the absence of accountability to safely pursue whatever',
      'minor offenses are common among its youth.'
    ]
  ]
}

describe('<TermOfUse />', () => {
  it('renders', () => {
    const wrapper = shallow(
      <TermOfUse content={data.content} label={data.label} />
    )
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders next button', () => {
    const wrapper = shallow(
      <TermOfUse content={data.content} label={data.label} />
    )

    expect(wrapper.find(TermsOfUseButton).exists()).toBeTruthy()
    expect(
      wrapper
        .find(TermsOfUseButton)
        .children()
        .text()
    ).toEqual(data.label)
  })

  it('fires given next function', () => {
    const nextStepMock = jest.fn()
    const wrapper = shallow(
      <TermOfUse
        nextStep={nextStepMock}
        content={data.content}
        label={data.label}
      />
    )

    const button = wrapper.find(TermsOfUseButton)
    button.simulate('click')
    expect(nextStepMock).toHaveBeenCalled()
  })
})
