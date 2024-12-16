export class WoTBlind_v1_0_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent){

        this.datastore = {
            position: config.position
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'position': {
                'readHandler': (options) => this.readPosition(options),
                'writeHandler': (name, value, options) => this.writePosition(name, value, options),
                'observeHandler': (options) => this.readPosition(options)
            }
        };

    }

    readPosition(options){
        return new Promise((resolve, reject) => resolve({ [ 'position' ]: this.datastore.position }));
    }

    writePosition(name, value, options){
        return new Promise((resolve, reject) => {
            this.datastore.position = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ){
                resolve();
            } else {
                this.emitPropertyChange('position')
                .then(() => {
                    this.emitEvent('onChangePosition', { [ 'position' ]: this.datastore.position })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));

                })
                .catch((error) => reject(error));
            }
        });
    }
}