import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Header from 'components/Header/Header';

export default class PageLayout extends Component {
  render() {
    const { children, className } = this.props;

    return (
      <div className={ className }>
        <Header />
        <div className='container' style={ { width: 300 } }>
          { children }
        </div>
      </div>
    );
  }
}

PageLayout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
