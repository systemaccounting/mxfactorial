import React from 'react';
import ReactDOM from 'react-dom';

class Main extends React.Component {
	render() {
		return (
		  <div>
		    <h1>This is an app!</h1>
		  </div>
		);
	}
}
const app = document.getElementById('app');
ReactDOM.render(<Main />, app);