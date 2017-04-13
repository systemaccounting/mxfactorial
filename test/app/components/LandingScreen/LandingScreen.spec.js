import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import LandingScreen from 'components/LandingScreen/LandingScreen';
import Logo from 'components/LandingScreen/Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingScreenContent from 'components/LandingScreen/LandingScreenContent';
import configureStore from 'store/configureStore';

describe('LandingScreen component', () => {
  let instance;
  const store = configureStore(undefined, true);

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render MobileLayout, Logo, LandingScreenContent', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <LandingScreen location={ { state: {} } }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, Logo).length.should.equal(1);
    scryRenderedComponentsWithType(instance, MobileLayout).length.should.equal(1);
    scryRenderedComponentsWithType(instance, LandingScreenContent).length.should.equal(1);
  });
});
