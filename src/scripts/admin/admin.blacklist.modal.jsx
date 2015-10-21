// dependencies -------------------------------------------------------

import React      from 'react';
import Reflux     from 'reflux';
import adminStore from './admin.store';
import actions    from './admin.actions';
import Input      from '../common/forms/input.jsx';
import WarnButton from '../common/forms/warn-button.jsx';
import {Modal}    from 'react-bootstrap';

let BlacklistModal = React.createClass({

	mixins: [Reflux.connect(adminStore)],

// life cycle events --------------------------------------------------

	render() {
		let blacklistForm = this.state.blacklistForm;

		return (
			<Modal show={this.state.showBlacklistModal} onHide={this._hide}>
            	<Modal.Header closeButton>
            		<Modal.Title>Blacklist User</Modal.Title>
            	</Modal.Header>
            	<hr className="modal-inner" />
            	<Modal.Body>
            		<div>
						{this._blacklistError()}
						<Input placeholder="gmail address" type="text"  value={blacklistForm._id}       name={'_id'}       onChange={this._inputChange} />
						<Input placeholder="first name"    type="text"  value={blacklistForm.firstname} name={'firstname'} onChange={this._inputChange} />
						<Input placeholder="last name"     type="text"  value={blacklistForm.lastname}  name={'lastname'}  onChange={this._inputChange} />
						<Input placeholder="note"          type="text"  value={blacklistForm.note}      name={'note'}      onChange={this._inputChange} />
			    		<button className="btn-blue" onClick={actions.blacklistSubmit} >
							<span>Block User</span>
						</button>
					</div>
            	</Modal.Body>
            </Modal>
    	);
	},

// custom methods -----------------------------------------------------

	_blacklistError() {
		return this.state.blacklistError ? <div className="alert alert-danger">{this.state.blacklistError}</div> : null;
	},

	_inputChange (e) {actions.inputChange('blacklistForm', e.target.name, e.target.value);},

	_hide() {
		actions.update({showBlacklistModal: false});
	},

});

export default BlacklistModal;