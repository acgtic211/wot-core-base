export class WoTACRemote_2 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            status: config.status
        };
        this.securityManager = securityManager;

        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'temperature': {
                'readHandler': (options) => this.readTemperature(options),
                'writeHandler': (name, value, options) => this.writeTemperature(name, value, options),
                'observeHandler': (options) => this.readTemperature(options)
            },
            'status': {
                'readHandler': (options) => this.readStatus(options),
                'writeHandler': (name, value, options) => this.writeStatus(name, value, options),
                'observeHandler': (options) => this.readStatus(options)
            },
            'increase': {
                'actionHandler': (name, inputs, options) => this.increase(name, inputs, options)
            },
            'decrease': {
                'actionHandler': (name, inputs, options) => this.decrease(name, inputs, options)
            },
            'toggle': {
                'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
            }
        };
    }

    readTemperature(options){
        return new Promise((resolve, reject) => {
            resolve({
                ['temperature']: this.datastore.temperature
            });
        });
    }

    writeTemperature(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.temperature = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('temperature')
                .then(() => {
                    this.emitEvent('temperatureStatus', { ['temperature']: this.datastore.temperature })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    readStatus(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['status']: this.datastore.status
            });
        });
    }

    writeStatus(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.status = !value;

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
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    increase(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature + 1, options);
    }

    decrease(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature - 1, options);
    }

    toggle(name, inputs, options) {
        return this.writeStatus('status', this.datastore.status, options);
    }

}