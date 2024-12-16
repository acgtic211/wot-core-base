export class WoTKNXLight_v1_1_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            status: false,
            address: config.address,
            readGroup: config.readGroup,
            writeGroup: config.writeGroup,
            dataType: config.dataType
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'status': {
                'readHandler': (options) => this.readStatus(options),
                'writeHandler': (name, value, options) => this.writeStatus(name, value, options),
                'observeHandler': (options) => this.readStatus(options)
            }
        };
    }

    readStatus(options) {
        return new Promise((resolve, reject) => resolve({ ['status']: this.datastore.status}));
        
    }

    writeStatus(name, value, options) {
        return new Promise((resolve, reject) => {
			this.datastore.status = value;

			if(
				(options !== undefined) &&
				(options.data !== undefined) &&
				(options.data.init !== undefined) &&
				(options.data.init === true)
			) {
				resolve();
			} else {
				this.emitPropertyChange('status')
				.then(() => {
					this.emitEvent('onChangeStatus', { ['status']: this.datastore.status })
					.then(() => {
// console.log('emitiendo', { ['status']: this.datastore.status })					    
					    resolve();
					})
					.catch((error) => reject(error));
				})
				.catch((error) => reject(error));
			}	
		});
    }

}