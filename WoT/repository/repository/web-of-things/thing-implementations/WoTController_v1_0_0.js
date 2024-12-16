export class WoTController_v1_0_0 {
	constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
	    this.datastore = {
    		state: config.state
	    };
	    
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
		
		this.emitPropertyChange = emitPropertyChange;
		this.emitEvent = emitEvent;
		
		this.handlers = {
			'state': {
				'readHandler': (options) => this.readState(options), 
				'writeHandler': (name, value, options) => this.writeState(name, value, options),
				'observeHandler': (options) => this.readStatus(options)
			},
			'changeState': {
				'actionHandler': (name, inputs, options) => this.changeState(name, inputs, options)
			}
		};
	}

	
	readState(options) {
		return new Promise((resolve, reject) => resolve({ ['state']: this.datastore.state }));
	}

	
	writeState(name, value, options) {
		return new Promise((resolve, reject) => {
			this.datastore.state = value;

			if(
				(options !== undefined) &&
				(options.data !== undefined) &&
				(options.data.init !== undefined) &&
				(options.data.init === true)
			) {
				resolve();
			} else {
				this.emitPropertyChange('state')
				.then(() => {
					this.emitEvent('onChangeState', { ['state']: this.datastore.state })
					.then(() => resolve())
					.catch((error) => reject(error));
				})
				.catch((error) => reject(error));
			}	
		});
	}

	changeState(name, inputs, options) {
		return this.writeState('state', inputs, options);
	}

	toggle(name, inputs, options){
		return this.writeState('state', !this.datastore.state.on, options);
	}

}