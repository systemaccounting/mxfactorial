import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import LandingPage from 'components/LandingPage/LandingPage';
import Logo from 'components/LandingPage/Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingPageBody from 'components/LandingPage/LandingPageBody';
import configureStore from 'store/configureStore';

describe('LandingPage component', () => {
  let instance;
  const store = configureStore(undefined, true);

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render MobileLayout, Logo, LandingPageBody', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <LandingPage/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, Logo).length.should.equal(1);
    scryRenderedComponentsWithType(instance, MobileLayout).length.should.equal(1);
    scryRenderedComponentsWithType(instance, LandingPageBody).length.should.equal(1);
  });
});
