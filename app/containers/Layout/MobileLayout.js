import React from 'react';

export default class MobileLayout extends React.Component {
  render() {
    return (
      <div className="container" style={{width: 300}}>
        <div style={{marginTop: 20, marginBottom: 20}}>
          {this.props.children[0]}
        </div>
        <div>
          {this.props.children[1]}
        </div>
      </div>
     );
  }
}