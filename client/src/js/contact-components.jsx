import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import {mao} from './mao.js';

export class ContactsView extends React.Component {

	constructor(props) {
		super(props);
		var self = this;
		this.contactMao = mao("contact");
		self.state = {data: []};
	}

	componentDidMount(){
		var self = this;

		this.contactMao.list().then(function(contacts){
			contacts = contacts || [];
			console.log(contacts);
			self.setState({data: contacts});
		});		
	}

	// --------- UI Events --------- //
	// --------- /UI Events --------- //

	render() {
		var self = this;
		var contacts = this.state.data;
		console.log(contacts);
		return <div className="ContactsView">
						<header>
							<h1>Contacts List</h1>
						</header>
						<section className="content">
							{contacts.map(function(contact, idx) {
								return <ContactItem	key={contact.id}
													idx={idx}
													eid={contact.id}
													email={contact.email}  />;
							})}
						</section>
					</div>;
	}
}


class ContactItem extends React.Component{

	constructor(props) {
		super(props);
		this.state = {};
	}

	// --------- Data Update Methods --------- //
	// --------- /Data Update Methods --------- //

	render(){
		return <div className="ContactItem">
			<div className="view">
				<span className="email">{this.props.email}</span>			
			</div>
		</div>;
	}
}

ContactItem.propTypes = {
	"eid": React.PropTypes.number,
	"idx": React.PropTypes.number,
	"email": React.PropTypes.string
};

