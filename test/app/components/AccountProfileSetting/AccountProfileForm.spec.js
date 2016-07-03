import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import AccountProfileForm from 'components/AccountProfileSetting/AccountProfileForm';

describe('AccountProfileForm component', () => {
  let instance;
  const handleSubmit = f => f;
  const fields = {
    first_name: {},
    middle_name: {},
    last_name: {},
    date_of_birth: {},
    street_number: {},
    street_name: {},
    unit_number: {},
    floor_number: {},
    city: {},
    state: {},
    postal_code: {},
    country: {},
    telephone_country_code: {},
    telephone_area_code: {},
    telephone_number: {},
    occupation: {},
    industry: {}
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle save', () => {
    instance = renderIntoDocument(
      <AccountProfileForm fields={ fields } handleSubmit={ handleSubmit } />
    );

    const push = spy();
    instance.context.router = { push };
    const profileForm = findRenderedDOMComponentWithTag(instance, 'form');
    Simulate.submit(profileForm);

    push.should.be.calledWith('/AccountProfile/Confirm');
  });
});
