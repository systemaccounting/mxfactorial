import React, { Component } from 'react';
import { connect } from 'react-redux';

class BaseLayout extends Component {

  render() {
    return (
      <div id="landingPage" className="fullBg padding14 fontGray boldFont">
        { this.props.children }
      </div>
    );
  }
}

export default connect()(BaseLayout);
