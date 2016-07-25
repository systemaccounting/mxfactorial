import React, { Component } from 'react';

export default (Children, state={}) => (
  class Parent extends Component {
    constructor(props) {
      super(props);
      this.state = state;
    }

    render() {
      return <Children ref='child' { ...this.state } />;
    }
  }
);
