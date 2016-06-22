import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import LandingPage from 'components/LandingPage/LandingPage';
import Logo from 'components/LandingPage/Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingPageBody from 'components/LandingPage/LandingPageBody';

describe('LandingPage component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render MobileLayout, Logo, LandingPageBody', () => {
    instance = renderIntoDocument(<LandingPage/>);
    scryRenderedComponentsWithType(instance, Logo).length.should.equal(1);
    scryRenderedComponentsWithType(instance, MobileLayout).length.should.equal(1);
    scryRenderedComponentsWithType(instance, LandingPageBody).length.should.equal(1);
  });
});
