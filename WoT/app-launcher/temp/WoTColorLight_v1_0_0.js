export class WoTColorLight_v1_0_0 {
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
				'readHandler': (options) => this.readState(options)
			}
		};
	}

    readState(options){
        return new Promise((resolve, reject) => resolve({ ['state']:this.datastore.state }))
    }
}