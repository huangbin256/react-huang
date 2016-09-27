import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import {mao} from './mao.js';

export class ContactsView extends React.Component {

	constructor(props) {
		super(props);
		var self = this;
		this.contactMao = mao("contact");
		self.state = {data: [], showDialog: false};
	}

	componentDidMount(){
		var self = this;


		this.dataChangeListenId = this.contactMao.listen(this.dataChange.bind(this));

		this.contactMao.list().then(function(contacts){
			contacts = contacts || [];
			self.setState({data: contacts});
		});		
	}

	componentWillUnmount(){
		this.contactMao.unlisten(this.dataChangeListenId);
	}

	dataChange(){
		var self = this;
		this.contactMao.list().then(function(contacts){
			contacts = contacts || [];
			self.setState({data: contacts});
		});
	}

	// --------- UI Events --------- //
	handleClickAdd(){
		this.setState({showDialog: true});
	}

	handleClickEdit(item){

		var createProps = this.refs.contactDialog.getInputValues();
	}

	handleClickDelete(item){
		this.contactMao.remove(item.props.idx);
	}

	handleDialogClose(){
		this.setState({showDialog: false});
	}

	handleDialogSave(){
		var self = this;
		var createProps = this.refs.contactDialog.getInputValues();
		this.contactMao.create(createProps).then(function(){
			self.setState({showDialog: false});
		});
	}

	// --------- /UI Events --------- //

	render() {
		var self = this;
		var contacts = this.state.data;
		var ifShowDialog = !this.state.showDialog ? null : <ContactDialog ref="contactDialog" onCancel={this.handleDialogClose.bind(this)} 
																					 onSave={this.handleDialogSave.bind(this)}/>;


		return <div className="ContactsView">
						<header>
							<h1>Contacts List</h1>
							<div className="btn btn-primary" onClick={this.handleClickAdd.bind(this)}>Add</div>
						</header>
						<section className="content">
							{contacts.map(function(contact, idx) {
								return <ContactItem	key={contact.id}
													idx={contact.id}
													email={contact.email}
													onEdit={self.handleClickEdit.bind(self)}
													onDelete={self.handleClickDelete.bind(self)}/>;
							})}
						</section>

						{ifShowDialog}
					</div>;
	}
}


class ContactItem extends React.Component{

	constructor(props) {
		super(props);
		this.state = {};
	}

	// --------- Data Update Methods --------- //
	handleEdit(){
		this.props.onEdit(this);
	}

	handleDel(){
		this.props.onDelete(this);	
	}
	// --------- /Data Update Methods --------- //

	render(){
		return <div className="ContactItem">
			<div className="view">
				<span className="email">{this.props.email}</span>
				<span className="btn btn-default hide" onClick={this.handleEdit.bind(this)}>Edit</span>		
				<span className="btn btn-danger" onClick={this.handleDel.bind(this)}>Delete</span>					
			</div>
		</div>;
	}
}

ContactItem.propTypes = {
	"idx": React.PropTypes.number,
	"email": React.PropTypes.string,
	onEdit: React.PropTypes.func,
	onDelete: React.PropTypes.func
};

class ContactDialog extends React.Component{

	constructor(props) {
		super(props);
		this.state = {};
	}

	getInputValues(){
		var result = {};
		result.id = this.props.id;
		result.email = this.refs.email.value;
		result.firstName = this.refs.firstName.value;
		result.lastName = this.refs.lastName.value;
		return result;
	}

	render(){
		return <div className="ContactDialog modal show">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" onClick={this.props.onCancel.bind(this)}><span>×</span></button>
							<h4 className="modal-title">Contact Edit</h4>
						</div>
						<div className="modal-body">
							<div className="form-group">
								<label>Email address</label>
								<input type="email" ref="email" className="form-control" placeholder="Email Address"/>
							</div>
							<div className="form-group">
								<label>First Name</label>
								<input type="text" ref="firstName" className="form-control" placeholder="First Name" />
							</div>
							<div className="form-group">
								<label>Last Name</label>
								<input type="text" ref="lastName" className="form-control" placeholder="Last Name" />
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" onClick={this.props.onCancel.bind(this)}>Close</button>
							<button type="button" className="btn btn-primary" onClick={this.props.onSave.bind(this)}>Save</button>
						</div>
					</div>
				</div>
			</div>;
	}
}

ContactDialog.propTypes = {
	id: React.PropTypes.number,
	onCancel: () => {},
	onSave: () => {}
};
