export class WoTKNXSwitch_v1_1_0 {

    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent){
        this.datastore = {
            status: config.status,
            address: config.address,
            readGroup: config.readGroup,
            writeGroup: config.writeGroup,
            dataType: config.dataType,
            pathname: config.pathname,
            target: config.target
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
            },
            'toggle': {
                'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
            }
        };
    
    }

    readStatus(options) {
        return new Promise((resolve, reject) => {
            
            resolve({ ['status']: this.datastore.status })
        });

    }

    writeStatus(name, value, options) {

        return new Promise((resolve, reject) => {
            this.datastore.status = value;
            console.log('status: ' + this.datastore.status.value);
            this.emitPropertyChange('status')
            .then(() => {
                this.emitEvent('onChangeStatus', {"value": value.value})
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });

    }

    toggle(name, inputs, options) {
        return this.writeStatus('status', inputs, options);
    }

}
