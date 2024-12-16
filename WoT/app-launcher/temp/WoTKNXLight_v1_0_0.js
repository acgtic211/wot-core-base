export class WoTKNXLight_v1_0_0 {
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
        return new Promise((resolve, reject) => {
            this.protocolManager.knxManager.readService(this.datastore.address, this.datastore.readGroup, this.datastore.dataType)
            .then((data) => {
                this.datastore.status = data;
                
                resolve({ ['status']: this.datastore.status });
            })
            .catch((error) => reject(error));
            
        });
    }

    writeStatus(name, value, options) {
        return new Promise((resolve, reject) => {
            //console.log('value', value);
            this.protocolManager.knxManager.writeService(this.datastore.address, this.datastore.writeGroup, this.datastore.dataType, value)
            .then((data) => {
                this.datastore.status = data;
                
                this.emitPropertyChange('status')
                .then(() => {
                    this.emitEvent('onChangeStatus', value)
                    .then(() => resolve())
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
            
        });
    }

}