import {ContactsView} from './contact-components.jsx';

// main.js 
var ReactDOM = require('react-dom');
var React = require('react');


document.addEventListener("DOMContentLoaded", function(event) {
	ReactDOM.render(<ContactsView />, document.getElementById('contacts-ctn'));
});